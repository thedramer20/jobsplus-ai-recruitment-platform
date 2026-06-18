import { render, screen, act, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { SignUpStep1 } from './SignUpStep1'

// framer-motion is globally mocked in src/test/setup.ts

// ── MagicCard stub ────────────────────────────────────────────────────────────
vi.mock('@/components/magic/MagicCard', () => ({
  MagicCard: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
    gradientColor?: string
  }) => <div className={className}>{children}</div>,
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SignUpStep1', () => {
  it('renders the "I\'m looking for a job" option', () => {
    render(<SignUpStep1 onNext={vi.fn()} />)
    expect(screen.getByText(/looking for a job/i)).toBeInTheDocument()
  })

  it("renders the \"I'm hiring talent\" option", () => {
    render(<SignUpStep1 onNext={vi.fn()} />)
    expect(screen.getByText(/hiring talent/i)).toBeInTheDocument()
  })

  it('renders the page heading', () => {
    render(<SignUpStep1 onNext={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /join jobplus/i })).toBeInTheDocument()
  })

  it('calls onNext with "JOB_SEEKER" when "looking for a job" is clicked', async () => {
    vi.useFakeTimers()
    const onNext = vi.fn()
    render(<SignUpStep1 onNext={onNext} />)

    fireEvent.click(screen.getByText(/looking for a job/i))
    // handleSelect uses a 300ms setTimeout before calling onNext
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(onNext).toHaveBeenCalledWith('JOB_SEEKER')
    vi.useRealTimers()
  })

  it('calls onNext with "EMPLOYER" when "hiring talent" is clicked', async () => {
    vi.useFakeTimers()
    const onNext = vi.fn()
    render(<SignUpStep1 onNext={onNext} />)

    fireEvent.click(screen.getByText(/hiring talent/i))
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(onNext).toHaveBeenCalledWith('EMPLOYER')
    vi.useRealTimers()
  })

  it('does not call onNext before the 300ms delay elapses', async () => {
    vi.useFakeTimers()
    const onNext = vi.fn()
    render(<SignUpStep1 onNext={onNext} />)

    fireEvent.click(screen.getByText(/looking for a job/i))
    // Only 100ms has passed — callback should NOT have fired yet
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(onNext).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
