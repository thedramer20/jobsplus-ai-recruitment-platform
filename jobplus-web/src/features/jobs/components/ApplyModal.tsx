import { useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { X, Send, Upload, FileText, Loader2 } from 'lucide-react'
import { Confetti } from '@/components/magic/Confetti'
import { applyToJob } from '@/api/jobs'
import type { ApplyJobDTO } from '@/api/jobs'
import { uploadResume } from '@/api/profile'
import { getApiErrorMessage } from '@/api/client'
import { useUIStore } from '@/store/uiStore'

interface ApplyModalProps {
  jobId: number
  jobTitle: string
  isOpen: boolean
  onClose: () => void
  seekerResumeUrl?: string | null
  onApplied?: () => void
}

const RESUME_ACCEPT = '.pdf,.doc,.docx'

export function ApplyModal({ jobId, jobTitle, isOpen, onClose, seekerResumeUrl, onApplied }: ApplyModalProps) {
  const addToast = useUIStore((s) => s.addToast)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState(seekerResumeUrl ?? '')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ApplyJobDTO) => applyToJob(jobId, data),
    onSuccess: () => {
      setShowConfetti(true)
      setSuccess(true)
      onApplied?.()
      setTimeout(() => {
        setShowConfetti(false)
        onClose()
      }, 2500)
    },
    onError: (err: unknown) => {
      setError(getApiErrorMessage(err) || 'Failed to submit application. Please try again.')
    },
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      addToast('Resume must be under 5 MB', 'error')
      return
    }
    setUploading(true)
    try {
      const { resumeUrl: url } = await uploadResume(file)
      setResumeUrl(url)
      addToast('Resume uploaded', 'success')
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Resume upload failed', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    mutate({
      coverLetter: coverLetter.trim() || undefined,
      resumeUrl: resumeUrl.trim() || undefined,
    })
  }

  const fileName = resumeUrl ? resumeUrl.split('/').pop() : null

  const charCount = coverLetter.length
  const MAX_CHARS = 2000

  return (
    <>
      <Confetti active={showConfetti} />
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Apply for position</h2>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{jobTitle}</p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {success ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <Send className="h-7 w-7 text-accent" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Application submitted!</p>
                  <p className="mt-1 text-sm text-slate-500">Good luck with your application.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Cover letter */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Cover letter <span className="text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value.slice(0, MAX_CHARS))}
                      rows={5}
                      placeholder="Tell the employer why you're a great fit..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {charCount}/{MAX_CHARS}
                    </p>
                  </div>

                  {/* Resume */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Resume <span className="text-slate-400">(optional)</span>
                    </label>

                    {fileName ? (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                          <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="truncate">{fileName}</span>
                          {seekerResumeUrl && resumeUrl === seekerResumeUrl && (
                            <span className="flex-shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              from profile
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setResumeUrl('')}
                          className="flex-shrink-0 text-xs font-medium text-slate-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3.5 py-3 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                      >
                        {uploading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                        ) : (
                          <><Upload className="h-4 w-4" /> Upload resume (PDF or Word)</>
                        )}
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={RESUME_ACCEPT}
                      onChange={handleFileChange}
                      className="hidden"
                      aria-label="Upload resume"
                      title="Upload resume"
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isPending}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isPending ? 'Submitting…' : 'Submit Application'}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
