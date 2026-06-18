import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Minimize2, Briefcase, ExternalLink } from 'lucide-react'
import { useChatbotStore } from '@/store/chatbotStore'
import { PulsatingButton } from '@/components/magic/PulsatingButton'
import { BorderBeam } from '@/components/magic/BorderBeam'
import { type ChatMessage, type JobLink } from '@/api/chatbot'

const FAB_SIZE = 56
const PANEL_WIDTH = 380
const PANEL_HEIGHT = 500
const EDGE_GAP = 16
const PANEL_GAP = 12
const MOBILE_MARGIN = 12
const POSITION_STORAGE_KEY = 'jobplus-chatbot-position'

type LauncherPosition = {
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getDefaultLauncherPosition(): LauncherPosition {
  if (typeof window === 'undefined') {
    return { x: EDGE_GAP, y: EDGE_GAP }
  }

  return {
    x: window.innerWidth - FAB_SIZE - EDGE_GAP,
    y: window.innerHeight - FAB_SIZE - EDGE_GAP,
  }
}

function clampLauncherPosition(position: LauncherPosition): LauncherPosition {
  if (typeof window === 'undefined') return position

  return {
    x: clamp(position.x, EDGE_GAP, window.innerWidth - FAB_SIZE - EDGE_GAP),
    y: clamp(position.y, EDGE_GAP, window.innerHeight - FAB_SIZE - EDGE_GAP),
  }
}

function TypingIndicator() {
  return (
    <div className="mr-auto flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 dark:bg-white/10">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function JobCard({ job }: { job: JobLink }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="mt-1.5 flex items-center gap-2 rounded-xl border border-primary/25 bg-white px-2.5 py-2 transition hover:border-primary/50 hover:bg-primary/5 dark:bg-slate-800 dark:hover:bg-primary/10"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Briefcase className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-primary">{job.title}</p>
        <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
          {job.company}
          {job.location ? ` · ${job.location}` : ''}
          {job.salaryRange ? ` · ${job.salaryRange}` : ''}
        </p>
      </div>
      <ExternalLink className="h-3 w-3 flex-shrink-0 text-primary/50" />
    </Link>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      className={`flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={
          isUser
            ? 'ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-white'
            : 'mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-white/10 dark:text-white'
        }
      >
        {message.content}
        {message.jobs && message.jobs.length > 0 && (
          <div className="mt-1">
            {message.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
      <span className="px-1 text-[10px] text-slate-400">
        {formatTime(message.timestamp)}
      </span>
    </motion.div>
  )
}

export function ChatbotWidget() {
  const { isOpen, messages, isTyping, open, close, sendMessage } =
    useChatbotStore()
  const [inputValue, setInputValue] = useState('')
  const [launcherPosition, setLauncherPosition] = useState<LauncherPosition>(() => {
    if (typeof window === 'undefined') return { x: EDGE_GAP, y: EDGE_GAP }

    const saved = window.localStorage.getItem(POSITION_STORAGE_KEY)
    if (!saved) return getDefaultLauncherPosition()

    try {
      return clampLauncherPosition(JSON.parse(saved) as LauncherPosition)
    } catch {
      return getDefaultLauncherPosition()
    }
  })
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dragStateRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
    moved: boolean
  } | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(launcherPosition))
  }, [launcherPosition])

  useEffect(() => {
    const handleResize = () => {
      setLauncherPosition((current) => clampLauncherPosition(current))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return
    setInputValue('')
    void sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLauncherPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - launcherPosition.x,
      offsetY: event.clientY - launcherPosition.y,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(false)
  }

  const handleLauncherPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const nextPosition = clampLauncherPosition({
      x: event.clientX - dragState.offsetX,
      y: event.clientY - dragState.offsetY,
    })

    const movedEnough =
      Math.abs(nextPosition.x - launcherPosition.x) > 3 ||
      Math.abs(nextPosition.y - launcherPosition.y) > 3

    if (movedEnough && !dragState.moved) {
      dragState.moved = true
      setIsDragging(true)
    }

    setLauncherPosition(nextPosition)
  }

  const handleLauncherPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    const wasDrag = dragState.moved
    dragStateRef.current = null
    setTimeout(() => setIsDragging(false), 0)

    if (!wasDrag) {
      open()
    }
  }

  const handleLauncherPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    dragStateRef.current = null
    setIsDragging(false)
  }

  const panelWidth = typeof window !== 'undefined' && window.innerWidth < 640
    ? window.innerWidth - MOBILE_MARGIN * 2
    : PANEL_WIDTH
  const panelLeft = typeof window !== 'undefined'
    ? clamp(
      launcherPosition.x + FAB_SIZE - panelWidth,
      MOBILE_MARGIN,
      window.innerWidth - panelWidth - MOBILE_MARGIN,
    )
    : MOBILE_MARGIN
  const panelTop = typeof window !== 'undefined'
    ? clamp(
      launcherPosition.y - PANEL_HEIGHT - PANEL_GAP,
      MOBILE_MARGIN,
      window.innerHeight - PANEL_HEIGHT - MOBILE_MARGIN,
    )
    : MOBILE_MARGIN

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="panel"
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              left: panelLeft,
              top: panelTop,
              width: panelWidth,
            }}
            className="fixed z-50 flex h-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <BorderBeam duration={8} colorFrom="#4338CA" colorTo="#10B981" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    JobPlus AI
                  </p>
                  <p className="text-[10px] text-slate-400">Career Advisor</p>
                </div>
              </div>
              <button
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-center text-sm text-slate-400">
                    Hello! I'm your AI career advisor.
                    <br />
                    Ask me anything about jobs, interviews,
                    <br />
                    or career growth.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-end gap-2 border-t border-slate-100 px-4 py-3 dark:border-white/10">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder="Ask something..."
                rows={1}
                className="max-h-[80px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-primary focus:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary dark:focus:bg-white/10"
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 80)}px`
                }}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !inputValue.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        style={{
          left: launcherPosition.x,
          top: launcherPosition.y,
        }}
        className="fixed z-50"
      >
        {/* FAB toggle */}
        <AnimatePresence>
          {!isOpen && (
          <motion.div
              key="fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <PulsatingButton
                pulseColor="#4338CA"
                onPointerDown={handleLauncherPointerDown}
                onPointerMove={handleLauncherPointerMove}
                onPointerUp={handleLauncherPointerUp}
                onPointerCancel={handleLauncherPointerCancel}
                ariaLabel="Open chat"
                buttonClassName={`touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform hover:scale-105">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              </PulsatingButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button shown when panel is open, alongside the panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.button
              key="close-fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-md transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
