import { create } from 'zustand'
import { type ChatMessage, type ChatTurn, sendMessage as sendMessageApi } from '@/api/chatbot'

interface ChatbotState {
  isOpen: boolean
  messages: ChatMessage[]
  isTyping: boolean
  open: () => void
  close: () => void
  toggle: () => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  isOpen: false,
  messages: [],
  isTyping: false,

  open: () => set({ isOpen: true }),

  close: () => set({ isOpen: false }),

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    set((state) => ({ messages: [...state.messages, userMessage] }))
    set({ isTyping: true })

    const history: ChatTurn[] = get().messages
      .filter((m) => m.id !== userMessage.id)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const { reply, jobs } = await sendMessageApi(content, history)
      const lastBotContent = get()
        .messages.filter((m) => m.role === 'assistant')
        .at(-1)?.content
      const finalReply =
        lastBotContent === reply && !jobs?.length
          ? reply + ' Is there anything specific you\'d like help with?'
          : reply
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: finalReply,
        jobs,
        timestamp: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
      }))
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false,
      }))
    }
  },

  clearMessages: () => set({ messages: [] }),
}))
