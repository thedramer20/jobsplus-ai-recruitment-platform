import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from './Navbar'

// framer-motion is globally mocked in src/test/setup.ts

// ── Store mocks ───────────────────────────────────────────────────────────────
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(() => vi.fn()),
}))

// ── API mock ──────────────────────────────────────────────────────────────────
vi.mock('@/api/notifications', () => ({
  getUnreadCount: vi.fn().mockResolvedValue(0),
}))

// ── Features mock ─────────────────────────────────────────────────────────────
vi.mock('@/features/notifications', () => ({
  NotificationsDrawer: () => null,
}))

// ── Asset mocks ───────────────────────────────────────────────────────────────
vi.mock('@/assets/logo/logo-full.svg', () => ({ default: 'logo-full.svg' }))
vi.mock('@/assets/logo/logo-icon.svg', () => ({ default: 'logo-icon.svg' }))

// ── Helper ────────────────────────────────────────────────────────────────────
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type { Role } from '@/types'
import { getUnreadCount } from '@/api/notifications'

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockUseUIStore = vi.mocked(useUIStore)

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={makeQueryClient()}>
        <Navbar />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseUIStore.mockReturnValue(vi.fn())
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Navbar — unauthenticated', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)
  })

  it('renders Login link', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })

  it('renders Sign Up link', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('does not render notification bell', () => {
    renderNavbar()
    expect(screen.queryByLabelText(/notification/i)).not.toBeInTheDocument()
  })
})

describe('Navbar — authenticated', () => {
  const mockUser = {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatarUrl: null,
    role: 'JOB_SEEKER' as Role,
    headline: null,
    location: null,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)
  })

  it('renders user initials in avatar button', () => {
    renderNavbar()
    // Initials derived from 'Alice Johnson' → 'AJ'
    expect(screen.getByRole('button', { name: /account menu/i })).toBeInTheDocument()
    expect(screen.getByText('AJ')).toBeInTheDocument()
  })

  it('does not render Login or Sign Up links', () => {
    renderNavbar()
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument()
  })

  it('opens dropdown with user name and email when avatar button is clicked', async () => {
    renderNavbar()
    const avatarBtn = screen.getByRole('button', { name: /account menu/i })
    await userEvent.click(avatarBtn)
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })
})

describe('Navbar — notification badge', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        avatarUrl: null,
        role: 'JOB_SEEKER' as Role,
        headline: null,
        location: null,
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
      },
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)
  })

  it('shows numeric badge when there are unread notifications', async () => {
    vi.mocked(getUnreadCount).mockResolvedValue(3)
    renderNavbar()
    // The badge appears after the query resolves; use findBy for async
    const badge = await screen.findByText('3')
    expect(badge).toBeInTheDocument()
  })

  it('shows 9+ when unread count is >= 10', async () => {
    vi.mocked(getUnreadCount).mockResolvedValue(12)
    renderNavbar()
    const badge = await screen.findByText('9+')
    expect(badge).toBeInTheDocument()
  })

  it('hides badge when unread count is 0', async () => {
    vi.mocked(getUnreadCount).mockResolvedValue(0)
    renderNavbar()
    // Wait briefly for query to settle then check badge is absent
    await screen.findByRole('button', { name: /notifications/i }) // wait for render
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
