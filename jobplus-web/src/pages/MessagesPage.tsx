import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Send, MessageSquare, ArrowLeft, Search, Edit3, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getApiErrorMessage } from '@/api/client'
import { Avatar } from '@/components/ui/Avatar'
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  type ConversationSummary,
  type MessageResponse,
} from '@/api/messages'
import { getMyConnections, getSuggestions } from '@/api/connections'

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function truncate(s: string | null, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max) + '…' : s
}


// ── ConversationItem ──────────────────────────────────────────────────────────

interface ConversationItemProps {
  convo: ConversationSummary
  selected: boolean
  onClick: () => void
}

function ConversationItem({ convo, selected, onClick }: ConversationItemProps) {
  return (
    <div className="px-2 py-0.5">
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          selected
            ? 'bg-indigo-50 dark:bg-indigo-900/20'
            : 'hover:bg-slate-50 dark:hover:bg-white/5'
        }`}
      >
        <div className="relative flex-shrink-0">
          <Avatar src={convo.otherUser.avatarUrl ?? null} name={convo.otherUser.name} size="md" />
          {convo.unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-[10px] font-bold text-white shadow-sm">
              {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-1">
            <p className={`truncate text-sm font-medium ${
              selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'
            }`}>
              {convo.otherUser.name}
            </p>
            {convo.lastMessageAt && (
              <span className="flex-shrink-0 text-[11px] text-slate-400">
                {timeAgo(convo.lastMessageAt)}
              </span>
            )}
          </div>
          <p className={`truncate text-xs ${
            convo.unreadCount > 0 ? 'font-medium text-slate-700 dark:text-slate-200' : 'text-slate-400'
          }`}>
            {truncate(convo.lastMessageContent, 40)}
          </p>
        </div>
        {selected && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />}
      </button>
    </div>
  )
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: MessageResponse
  isOwn: boolean
  otherUserInitial?: string
}

function MessageBubble({ message, isOwn, otherUserInitial }: MessageBubbleProps) {
  if (isOwn) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          <p className="mt-1 text-right text-[10px] text-white/60">{timeAgo(message.createdAt)}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-[11px] font-semibold text-white shadow-sm">
        {otherUserInitial ?? '?'}
      </div>
      <div className="max-w-[72%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-white dark:ring-white/10">
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <p className="mt-1 text-[10px] text-slate-400">{timeAgo(message.createdAt)}</p>
      </div>
    </div>
  )
}


// ── MessagesPanel ─────────────────────────────────────────────────────────────

interface MessagesPanelProps {
  conversationId: number
  currentUserId: number
  otherUserInitial: string
}

function MessagesPanel({ conversationId, currentUserId, otherUserInitial }: MessagesPanelProps) {
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onMutate: async (content) => {
      const optimistic: MessageResponse = {
        id: Date.now(),
        conversationId,
        senderId: currentUserId,
        content,
        readAt: null,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData<MessageResponse[]>(['messages', conversationId], (old = []) => [
        ...old,
        optimistic,
      ])
      return { optimistic }
    },
    onSuccess: (real, _content, context) => {
      queryClient.setQueryData<MessageResponse[]>(['messages', conversationId], (old = []) =>
        old.map((m) => (m.id === context?.optimistic.id ? real : m)),
      )
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (_err, content, context) => {
      queryClient.setQueryData<MessageResponse[]>(['messages', conversationId], (old = []) =>
        old.filter((m) => m.id !== context?.optimistic.id),
      )
      // Restore the text so the user can retry instead of losing their message.
      setText((prev) => (prev.length ? prev : content))
      useUIStore.getState().addToast('Message failed to send. Please try again.', 'error')
    },
  })

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sendMutation.isPending) return
    setText('')
    sendMutation.mutate(trimmed)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
                otherUserInitial={otherUserInitial}
              />
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/8"
          />
          <motion.button
            onClick={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
            whileTap={{ scale: 0.97 }}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm transition hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ── ConversationHeader ────────────────────────────────────────────────────────

interface ConversationHeaderProps {
  convo: ConversationSummary
  onBack?: () => void
}

function ConversationHeader({ convo, onBack }: ConversationHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
      {onBack && (
        <button
          onClick={onBack}
          className="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10 sm:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <Avatar src={convo.otherUser.avatarUrl ?? null} name={convo.otherUser.name} size="md" />
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {convo.otherUser.name}
        </p>
        {convo.otherUser.headline && (
          <p className="text-xs text-slate-400">{convo.otherUser.headline}</p>
        )}
      </div>
    </div>
  )
}

// ── NewMessageModal ───────────────────────────────────────────────────────────

interface NewMessageModalProps {
  onClose: () => void
  onConversationStarted: (conversationId: number) => void
}

function NewMessageModal({ onClose, onConversationStarted }: NewMessageModalProps) {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['my-connections-msg'],
    queryFn: getMyConnections,
  })

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions-msg'],
    queryFn: () => getSuggestions(8),
  })

  const startMutation = useMutation({
    mutationFn: startConversation,
    onSuccess: (convo) => {
      queryClient.setQueryData<ConversationSummary[]>(['conversations'], (old = []) => {
        if (old.find((c) => c.id === convo.id)) return old
        return [convo, ...old]
      })
      onConversationStarted(convo.id)
    },
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not start conversation', 'error'),
  })

  const connectedUsers = connections.filter((c) => c.status === 'ACCEPTED').map((c) => c.otherUser)
  const connectedIds = new Set(connectedUsers.map((u) => u.id))
  const otherUsers = suggestions.filter((u) => !connectedIds.has(u.id))
  const allUsers = [...connectedUsers, ...otherUsers]

  const filtered = search.trim()
    ? allUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Message</h2>
            <p className="text-xs text-slate-400">Search your connections</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                {search ? 'No people found' : 'No connections yet. Connect with people first.'}
              </p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => startMutation.mutate(u.id)}
                  disabled={startMutation.isPending}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-white/5"
                >
                  <Avatar src={u.avatarUrl ?? null} name={u.name} size="sm" className="flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                    {u.headline && <p className="truncate text-xs text-slate-400">{u.headline}</p>}
                  </div>
                  <Send className="h-4 w-4 flex-shrink-0 text-slate-300 dark:text-slate-600" />
                </button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── MessagesPage ──────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const v = searchParams.get('convo')
    return v ? Number(v) : null
  })
  const [search, setSearch] = useState('')

  const { data: conversations = [], isLoading, isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5000,
    retry: false,
  })

  // When navigated here with ?convo=N, ensure that conversation is loaded and selected
  useEffect(() => {
    const convoParam = searchParams.get('convo')
    if (!convoParam) return
    const id = Number(convoParam)
    setSelectedId(id)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const filtered = search.trim()
    ? conversations.filter((c) =>
        c.otherUser.name.toLowerCase().includes(search.toLowerCase()),
      )
    : conversations
  const selectedConvo = conversations.find((c) => c.id === selectedId) ?? null

  return (
    <PageTransition className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl overflow-hidden">
      {/* Left panel */}
      <div
        className={`flex flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 ${
          selectedConvo ? 'hidden sm:flex sm:w-80 sm:flex-shrink-0' : 'flex w-full sm:w-80 sm:flex-shrink-0'
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-4 py-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Messages</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowNewMsg(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              aria-label="New message"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
          {/* Search */}
          <div className="relative mt-2.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Couldn't load conversations</p>
              <p className="mt-1 text-xs text-slate-400">Check your connection and try again</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {search.trim() ? 'No conversations match your search' : 'No conversations yet'}
              </p>
              {!search.trim() && (
                <p className="mt-1 text-xs text-slate-400">Start a new message to connect with someone</p>
              )}
            </div>
          ) : (
            filtered.map((convo) => (
              <ConversationItem
                key={convo.id}
                convo={convo}
                selected={convo.id === selectedId}
                onClick={() => setSelectedId(convo.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div
        className={`min-h-0 flex-col bg-slate-50 dark:bg-surface-dark ${
          selectedConvo ? 'flex flex-1 overflow-hidden' : 'hidden sm:flex sm:flex-1'
        }`}
      >
        {selectedConvo && user ? (
          <>
            <ConversationHeader convo={selectedConvo} onBack={() => setSelectedId(null)} />
            <MessagesPanel
              conversationId={selectedConvo.id}
              currentUserId={user.id}
              otherUserInitial={selectedConvo.otherUser.name.slice(0, 1).toUpperCase()}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Your messages</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                Select a conversation or start a new one
              </p>
            </div>
            <motion.button
              type="button"
              onClick={() => setShowNewMsg(true)}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/30"
            >
              New Message
            </motion.button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showNewMsg && (
          <NewMessageModal
            onClose={() => setShowNewMsg(false)}
            onConversationStarted={(id) => {
              setShowNewMsg(false)
              setSelectedId(id)
            }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
