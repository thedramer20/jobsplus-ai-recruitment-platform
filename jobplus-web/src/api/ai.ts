import apiClient from './client'
import type { ApiResponse } from '@/types'

export interface ResumeAnalysis {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  missingSignals: string[]
  suggestedHeadline: string
  atsTips: string[]
}

export interface JobMatchAnalysis {
  score: number
  verdict: string
  summary: string
  matchingStrengths: string[]
  gaps: string[]
  recommendations: string[]
}

export interface InterviewQuestion {
  question: string
  whyItMatters: string
  answerTip: string
}

export interface InterviewSession {
  title: string
  intro: string
  questions: InterviewQuestion[]
  preparationTips: string[]
}

export interface InterviewFeedback {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  improvedAnswerTip: string
}

export interface InterviewSessionRequest {
  jobId?: number
  roleTitle?: string
  companyName?: string
  interviewFocus?: string
}

export interface InterviewFeedbackRequest {
  jobId?: number
  roleTitle?: string
  question: string
  answer: string
}

export const getResumeAnalysis = (): Promise<ResumeAnalysis> =>
  apiClient
    .get<ApiResponse<ResumeAnalysis>>('/ai/resume-analysis')
    .then((r) => r.data.data)

export const getJobMatchAnalysis = (jobId: number): Promise<JobMatchAnalysis> =>
  apiClient
    .get<ApiResponse<JobMatchAnalysis>>(`/ai/job-match/${jobId}`)
    .then((r) => r.data.data)

export const createInterviewSession = (data: InterviewSessionRequest): Promise<InterviewSession> =>
  apiClient
    .post<ApiResponse<InterviewSession>>('/ai/interview-coach/session', data)
    .then((r) => r.data.data)

export const getInterviewFeedback = (data: InterviewFeedbackRequest): Promise<InterviewFeedback> =>
  apiClient
    .post<ApiResponse<InterviewFeedback>>('/ai/interview-coach/feedback', data)
    .then((r) => r.data.data)
