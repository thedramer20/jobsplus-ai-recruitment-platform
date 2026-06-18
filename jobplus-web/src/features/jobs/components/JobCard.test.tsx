import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { JobCard } from './JobCard'
import type { Job } from '@/types'

// ── Framer Motion stub ────────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
}))

// ── Magic component stubs ─────────────────────────────────────────────────────
vi.mock('@/components/magic/BlurFade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/magic/MagicCard', () => ({
  MagicCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

// ── Test fixture ──────────────────────────────────────────────────────────────
const baseJob: Job = {
  id: 42,
  companyId: 1,
  company: {
    id: 1,
    name: 'TechCorp',
    logoUrl: null,
    industry: 'Technology',
    size: '100-500',
    location: 'San Francisco, CA',
    website: null,
    description: null,
    verified: true,
  },
  postedBy: 10,
  title: 'Senior Frontend Engineer',
  description: 'Build great UIs.',
  location: 'Remote',
  employmentType: 'FULL_TIME',
  experienceLevel: 'SENIOR',
  salaryMin: 120000,
  salaryMax: 160000,
  status: 'OPEN',
  postedAt: new Date().toISOString(),
  deadline: null,
  updatedAt: null,
  savedByCurrentUser: false,
}

function renderCard(props: Partial<Parameters<typeof JobCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <JobCard job={baseJob} {...props} />
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('JobCard', () => {
  it('renders the job title', () => {
    renderCard()
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
  })

  it('renders the company name', () => {
    renderCard()
    expect(screen.getByText('TechCorp')).toBeInTheDocument()
  })

  it('renders the job location', () => {
    renderCard()
    expect(screen.getByText('Remote')).toBeInTheDocument()
  })

  it('renders the employment type badge', () => {
    renderCard()
    expect(screen.getByText('FULL TIME')).toBeInTheDocument()
  })

  it('renders salary range', () => {
    renderCard()
    expect(screen.getByText('$120k – $160k')).toBeInTheDocument()
  })

  it('renders the save button with accessible label', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /save job/i })).toBeInTheDocument()
  })

  it('calls onSave when save button is clicked', async () => {
    const onSave = vi.fn()
    renderCard({ onSave })
    await userEvent.click(screen.getByRole('button', { name: /save job/i }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('calls onUnsave when button is clicked on an already-saved job', async () => {
    const onUnsave = vi.fn()
    renderCard({ job: { ...baseJob, savedByCurrentUser: true }, onUnsave })
    await userEvent.click(screen.getByRole('button', { name: /unsave job/i }))
    expect(onUnsave).toHaveBeenCalledTimes(1)
  })

  it('toggles save state visually on click', async () => {
    renderCard()
    const btn = screen.getByRole('button', { name: /save job/i })
    await userEvent.click(btn)
    // After clicking, aria-label should switch to 'Unsave job'
    expect(screen.getByRole('button', { name: /unsave job/i })).toBeInTheDocument()
  })

  it('renders "Competitive" when salary is null', () => {
    renderCard({ job: { ...baseJob, salaryMin: null, salaryMax: null } })
    expect(screen.getByText('Competitive')).toBeInTheDocument()
  })
})
