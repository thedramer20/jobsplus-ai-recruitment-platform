import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Users } from 'lucide-react'
import { getUsers, updateUserStatus, updateUserRole, deleteUser } from '@/api/admin'
import type { User } from '@/types'
import { Role } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageTransition } from '@/components/layout/PageTransition'

// ── Badges ────────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    [Role.JOB_SEEKER]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    [Role.EMPLOYER]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    [Role.ADMIN]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[role]}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
      }`}
    >
      {status}
    </span>
  )
}

// ── Row dropdown ──────────────────────────────────────────────────────────────

interface RowMenuProps {
  user: User
  onStatusChange: (id: number, status: string) => void
  onRoleChange: (id: number, role: string) => void
  onDelete: (id: number) => void
}

function RowMenu({ user, onStatusChange, onRoleChange, onDelete }: RowMenuProps) {
  const [open, setOpen] = useState(false)
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowRolePicker(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleStatusToggle() {
    setOpen(false)
    onStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setShowRolePicker(false); setConfirmDelete(false) }}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Row actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 origin-top-right rounded-xl border border-slate-200/60 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-slate-800">
          {showRolePicker ? (
            <div className="px-2 py-1">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Select new role
              </p>
              {([Role.JOB_SEEKER, Role.EMPLOYER, Role.ADMIN] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={user.role === r}
                  onClick={() => {
                    setOpen(false)
                    setShowRolePicker(false)
                    onRoleChange(user.id, r)
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors disabled:cursor-default disabled:opacity-50 ${
                    user.role === r
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  {r === Role.JOB_SEEKER ? 'Job Seeker' : r === Role.EMPLOYER ? 'Employer' : 'Admin'}
                  {user.role === r && (
                    <span className="ml-1.5 text-[10px] text-indigo-400">(current)</span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowRolePicker(false)}
                className="mt-1 w-full rounded-lg px-3 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStatusToggle}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                {user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
              </button>
              <button
                type="button"
                onClick={() => setShowRolePicker(true)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Change Role
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-white/10" />
              {confirmDelete ? (
                <div className="px-3 py-2">
                  <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">
                    Delete &ldquo;{user.name}&rdquo;?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); setConfirmDelete(false); onDelete(user.id) }}
                      className="flex-1 rounded-lg bg-red-500 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete User
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-5 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        </td>
      ))}
    </tr>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  onPrev: () => void
  onNext: () => void
}

function Pagination({ page, totalPages, totalElements, onPrev, onNext }: PaginationProps) {
  const btnBase =
    'rounded-lg border border-slate-200/60 px-3 py-1.5 text-sm font-medium transition-colors dark:border-white/10'
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">{totalElements} total</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 0}
          className={`${btnBase} disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5`}
        >
          Previous
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page + 1 >= totalPages}
          className={`${btnBase} disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filters change
  useEffect(() => { setPage(0) }, [role, status, debouncedSearch])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users', role, status, debouncedSearch, page],
    queryFn: () =>
      getUsers({
        role: role || undefined,
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        size: 20,
      }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) => updateUserStatus(id, s),
    onSuccess: invalidate,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, r }: { id: number; r: string }) => updateUserRole(id, r),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: invalidate,
  })

  const selectClass =
    'rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200'

  return (
    <PageTransition>
    <PageContainer size="full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage all registered users, roles, and account statuses.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
        <select title="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
          <option value="">All Roles</option>
          <option value="JOB_SEEKER">JOB_SEEKER</option>
          <option value="EMPLOYER">EMPLOYER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select title="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {error instanceof Error ? error.message : 'Failed to load users'}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">No data yet</p>
                    </div>
                  </td>
                </tr>
              ) : data?.content.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl ?? null} name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu
                        user={user}
                        onStatusChange={(id, s) => statusMutation.mutate({ id, s })}
                        onRoleChange={(id, r) => roleMutation.mutate({ id, r })}
                        onDelete={(id) => deleteMutation.mutate(id)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </PageContainer>
    </PageTransition>
  )
}
