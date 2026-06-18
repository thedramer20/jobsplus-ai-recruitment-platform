import apiClient from './client'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface JobLink {
  id: number
  title: string
  company: string
  location?: string
  type?: string
  salaryRange?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  jobs?: JobLink[]
  timestamp: string
}

export interface ChatReply {
  reply: string
  jobs?: JobLink[]
}

export async function sendMessage(
  message: string,
  history: ChatTurn[],
): Promise<ChatReply> {
  const res = await apiClient.post<{ data: ChatReply }>(
    '/chatbot/message',
    { message, conversationHistory: history },
  )
  return res.data.data
}
