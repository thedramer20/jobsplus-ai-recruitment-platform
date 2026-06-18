// ── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

export type UserRole = Role

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  REMOTE = 'REMOTE',
}

export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  REJECTED = 'REJECTED',
  OFFER = 'OFFER',
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

// ── Core entities ─────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  name: string
  headline: string | null
  avatarUrl: string | null
  location: string | null
  role: Role
  status: string
  createdAt: string
}

export interface SeekerProfile {
  userId: number
  bio: string | null
  yearsExperience: number
  educationSummary: string | null
  resumeUrl: string | null
  openToWork: boolean
}

export interface Company {
  id: number
  name: string
  logoUrl: string | null
  industry: string | null
  size: string | null
  location: string | null
  website: string | null
  description: string | null
  verified: boolean
  createdAt?: string
  jobCount?: number
}

export interface Job {
  id: number
  companyId: number
  company: Company | null
  postedBy: number
  title: string
  description: string
  location: string | null
  employmentType: string
  experienceLevel: string
  salaryMin: number | null
  salaryMax: number | null
  status: string
  postedAt: string
  deadline: string | null
  updatedAt: string | null
  savedByCurrentUser?: boolean
  appliedByCurrentUser?: boolean
}

export interface Application {
  id: number
  jobId: number
  job: Job | null
  seekerId: number
  seeker: User | null
  status: ApplicationStatus
  coverLetter: string | null
  resumeUrl: string | null
  appliedAt: string
  updatedAt: string | null
}

export interface Post {
  id: number
  authorId: number
  author: User
  content: string
  mediaUrl: string | null
  likeCount: number
  commentCount: number
  liked: boolean
  createdAt: string
}

export interface Connection {
  id: number
  requesterId: number
  addresseeId: number
  status: ConnectionStatus
  createdAt: string
}

export interface Notification {
  id: number
  userId: number
  type: string
  payload: Record<string, unknown>
  read: boolean
  createdAt: string
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: number
  participants: User[]
  lastMessage: Message | null
  unreadCount: number
  updatedAt: string
}

// ── Generic wrappers ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

export interface SmartMatchWeights {
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  locationMatch: number
  keywordRelevance: number
  profileCompleteness: number
}

export interface SmartMatchBreakdown {
  skillMatchScore: number
  experienceMatchScore: number
  educationMatchScore: number
  locationMatchScore: number
  keywordRelevanceScore: number
  profileCompletenessScore: number
  skillWeightedContribution: number
  experienceWeightedContribution: number
  educationWeightedContribution: number
  locationWeightedContribution: number
  keywordWeightedContribution: number
  completenessWeightedContribution: number
}

export interface SmartMatchResult {
  algorithmName: string
  algorithmVersion: string
  formula: string
  finalScore: number
  verdict: string
  summary: string
  weights: SmartMatchWeights
  breakdown: SmartMatchBreakdown
  strengths: string[]
  matchedKeywords: string[]
  missingSkills: string[]
  recommendations: string[]
}

export interface SmartMatchedJob {
  job: Job
  match: SmartMatchResult
}

export interface SmartMatchedCandidate {
  application: Application
  match: SmartMatchResult
}
