import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { ImagePlus, Video, X } from 'lucide-react'
import { createPost, uploadPostMedia } from '@/api/posts'
import { useUIStore } from '@/store/uiStore'
import { getApiErrorMessage } from '@/api/client'

interface CreatePostModalProps {
  onClose: () => void
  onCreated: () => void
  initialMediaFile?: File | null
}

export default function CreatePostModal({ onClose, onCreated, initialMediaFile = null }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(initialMediaFile)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const addToast = useUIStore((s) => s.addToast)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!mediaFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(mediaFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [mediaFile])

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      let mediaUrl: string | undefined
      if (mediaFile) mediaUrl = await uploadPostMedia(mediaFile)
      return createPost({ content, mediaUrl })
    },
    onSuccess: () => {
      onCreated()
      onClose()
      addToast('Post published', 'success')
    },
    onError: (err) => addToast(getApiErrorMessage(err) || 'Could not publish post. Please try again.', 'error'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !mediaFile) return
    mutate()
  }

  const isVideo = mediaFile?.type.startsWith('video/') ?? false

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Post</h2>
            <motion.button
              onClick={onClose}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              rows={4}
              maxLength={3000}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{content.length}/3000</p>

            {mediaFile && previewUrl && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-white/10">
                  <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    {isVideo ? <Video className="h-4 w-4 text-amber-500" /> : <ImagePlus className="h-4 w-4 text-emerald-500" />}
                    <span className="truncate">{mediaFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaFile(null)}
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10"
                    aria-label="Remove selected media"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {isVideo ? (
                  <video src={previewUrl} controls className="max-h-80 w-full bg-black object-contain" />
                ) : (
                  <img src={previewUrl} alt="Selected media preview" className="max-h-80 w-full object-cover" />
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={(!content.trim() && !mediaFile) || isPending}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {isPending ? 'Posting…' : 'Post'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
