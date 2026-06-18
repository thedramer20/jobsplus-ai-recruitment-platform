import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Heart, MessageCircle, Share2, Trash2, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Post } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { timeAgo } from '@/lib/timeAgo'
import { getComments, addComment } from '@/api/posts'
import { useUIStore } from '@/store/uiStore'

interface PostCardProps {
  post: Post
  onLikeToggle: (id: number, liked: boolean) => void
  onDelete?: (id: number) => void
  currentUserId: number
}

export default function PostCard({ post, onLikeToggle, onDelete, currentUserId }: PostCardProps) {
  const [localLiked, setLocalLiked] = useState(post.liked)
  const [localCount, setLocalCount] = useState(post.likeCount)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [shareFeedback, setShareFeedback] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const commentsKey = ['comments', post.id]

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: commentsKey,
    queryFn: () => getComments(post.id),
    enabled: showComments,
  })

  const submitMutation = useMutation({
    mutationFn: (content: string) => addComment(post.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey })
      setNewComment('')
    },
    onError: () => useUIStore.getState().addToast('Could not post comment. Please try again.', 'error'),
  })

  function handleLike() {
    const nextLiked = !localLiked
    setLocalLiked(nextLiked)
    setLocalCount((c) => (nextLiked ? c + 1 : c - 1))
    onLikeToggle(post.id, localLiked)
  }

  function toggleComments() {
    setShowComments((v) => !v)
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 200)
  }

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title: `Post by ${post.author.name} on JobPlus`,
      text: post.content.slice(0, 120) + (post.content.length > 120 ? '…' : ''),
      url,
    }
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        return
      }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(url)
    } catch { /* clipboard denied — silent */ }
    setShareFeedback(true)
    setTimeout(() => setShareFeedback(false), 2000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitMutation.isPending) return
    submitMutation.mutate(newComment.trim())
  }

  const isOwner = currentUserId === post.author.id
  const isVideoPost = post.mediaUrl
    ? /\.(mp4|webm|mov)(\?.*)?$/i.test(post.mediaUrl)
    : false

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:border-white/10 dark:bg-slate-800"
    >
      {/* Gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-4">
        <Avatar src={post.author.avatarUrl ?? null} name={post.author.name} size="md" className="flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">{post.author.name}</p>
          {post.author.headline && (
            <p className="max-w-[220px] truncate text-xs text-slate-500 dark:text-slate-400">{post.author.headline}</p>
          )}
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwner && onDelete && (
          confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { onDelete(post.id); setConfirmDelete(false) }}
                className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={() => setConfirmDelete(true)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          )
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="mt-3 whitespace-pre-wrap px-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {post.content}
        </p>
      )}

      {/* Media — full bleed */}
      {post.mediaUrl && (
        isVideoPost ? (
          <video
            src={post.mediaUrl}
            controls
            preload="metadata"
            className="mt-4 max-h-[420px] w-full bg-black object-contain"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt="Post media"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            className="mt-4 max-h-[420px] w-full object-cover"
          />
        )
      )}

      {/* Engagement stats */}
      {(localCount > 0 || (post.commentCount ?? 0) > 0) && (
        <div className="mx-5 mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          {localCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[8px] text-white">
                ♥
              </span>
              {localCount}
            </span>
          )}
          {(post.commentCount ?? 0) > 0 && (
            <button
              type="button"
              onClick={toggleComments}
              className="ml-auto transition-colors hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mx-5 mb-1 mt-2 flex items-center border-t border-slate-100 pt-1 dark:border-white/10">
        <motion.button
          type="button"
          onClick={handleLike}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
            localLiked
              ? 'text-red-500'
              : 'text-slate-500 hover:bg-slate-50 hover:text-red-400 dark:text-slate-400 dark:hover:bg-slate-700/50'
          }`}
          aria-label={localLiked ? 'Unlike post' : 'Like post'}
        >
          <motion.div
            animate={
              localLiked && !prefersReducedMotion
                ? { scale: [1, 1.45, 0.88, 1.12, 1], rotate: [0, -8, 8, -4, 0] }
                : { scale: 1 }
            }
            transition={{ duration: 0.38, times: [0, 0.2, 0.45, 0.7, 1] }}
          >
            <Heart className={`h-[18px] w-[18px] ${localLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </motion.div>
          {t('feed.like')}
        </motion.button>

        <button
          type="button"
          onClick={toggleComments}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
            showComments
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700/50'
          }`}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          {t('feed.comment')}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
            shareFeedback
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-300'
          }`}
        >
          <Share2 className="h-[18px] w-[18px]" />
          {shareFeedback ? t('feed.copied') : t('feed.share')}
        </button>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-white/10">
              {commentsLoading ? (
                <div className="flex animate-pulse gap-2">
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <p className="py-1 text-center text-xs text-slate-400 dark:text-slate-500">
                  {t('feed.noComments')}
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar
                      src={c.author.avatarUrl ?? null}
                      name={c.author.name}
                      size="sm"
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{c.author.name}</p>
                      <p className="mt-0.5 text-sm leading-snug text-slate-700 dark:text-slate-300">{c.content}</p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(c.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-1">
                <textarea
                  ref={inputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder={t('feed.writeComment')}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-700/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
                />
                <motion.button
                  type="submit"
                  disabled={!newComment.trim() || submitMutation.isPending}
                  whileTap={{ scale: 0.93 }}
                  className="flex-shrink-0 rounded-xl bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
