import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import PostCard from './PostCard'
import type { Post } from '@/types'
import { Role } from '@/types'

// ── Framer Motion stub ────────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      whileTap: _whileTap,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { whileTap?: unknown }) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ── Test fixture ──────────────────────────────────────────────────────────────
const basePost: Post = {
  id: 1,
  authorId: 10,
  author: {
    id: 10,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    headline: 'Frontend Engineer',
    avatarUrl: null,
    location: null,
    role: Role.JOB_SEEKER,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
  },
  content: 'Excited to share my latest project!',
  mediaUrl: null,
  likeCount: 7,
  commentCount: 3,
  liked: false,
  createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
}

function renderCard(overrides: Partial<typeof basePost> = {}, currentUserId = 99) {
  const post = { ...basePost, ...overrides }
  const onLikeToggle = vi.fn()
  const result = render(
    <PostCard post={post} onLikeToggle={onLikeToggle} currentUserId={currentUserId} />,
  )
  return { ...result, onLikeToggle }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PostCard', () => {
  it('renders the post content', () => {
    renderCard()
    expect(screen.getByText('Excited to share my latest project!')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    renderCard()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('renders the author headline', () => {
    renderCard()
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument()
  })

  it('renders the like count', () => {
    renderCard()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders the comment count', () => {
    renderCard()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onLikeToggle with post id and current liked state when like button is clicked', async () => {
    const { onLikeToggle } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: /like post/i }))
    expect(onLikeToggle).toHaveBeenCalledWith(1, false)
  })

  it('increments like count optimistically when post is not yet liked', async () => {
    renderCard({ liked: false, likeCount: 7 })
    await userEvent.click(screen.getByRole('button', { name: /like post/i }))
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('decrements like count when unliking a liked post', async () => {
    renderCard({ liked: true, likeCount: 7 })
    await userEvent.click(screen.getByRole('button', { name: /unlike post/i }))
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('does not show delete button for non-owner', () => {
    renderCard({}, 99) // currentUserId 99 ≠ author id 10
    expect(screen.queryByRole('button', { name: /delete post/i })).not.toBeInTheDocument()
  })

  it('shows delete button for post owner', () => {
    const onDelete = vi.fn()
    render(
      <PostCard
        post={basePost}
        onLikeToggle={vi.fn()}
        onDelete={onDelete}
        currentUserId={10} // matches author.id
      />,
    )
    expect(screen.getByRole('button', { name: /delete post/i })).toBeInTheDocument()
  })

  it('calls onDelete with post id when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(
      <PostCard
        post={basePost}
        onLikeToggle={vi.fn()}
        onDelete={onDelete}
        currentUserId={10}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /delete post/i }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
