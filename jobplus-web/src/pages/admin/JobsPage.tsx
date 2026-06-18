import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Briefcase } from 'lucide-react'
import { getJobs, updateJobStatus, deleteJob } from '@/api/admin'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageTransition } from '@/components/layout/PageTransition'

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    CLOSED: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
    DRAFT: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400',
  }
  const cls = map[status] ?? 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
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

export default function AdminJobsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { setPage(0) }, [statusFilter, debouncedSearch])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-jobs', statusFilter, debouncedSearch, page],
    queryFn: () =>
      getJobs({
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        page,
        size: 20,
      }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateJobStatus(id, status),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: invalidate,
  })

  const selectClass =
    'rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200'

  return (
    <PageTransition>
    <PageContainer size="full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage job listings, statuses, and removals.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search jobs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
        <select
          title="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
          <option value="DRAFT">DRAFT</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Posted
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
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {error instanceof Error ? error.message : 'Failed to load jobs'}
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
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">No data yet</p>
                    </div>
                  </td>
                </tr>
              ) : data?.content.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {job.company?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {job.employmentType}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {job.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: job.id, status: 'CLOSED' })}
                            disabled={statusMutation.isPending}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                          >
                            Close Job
                          </button>
                        )}
                        {confirmingDeleteId === job.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteId(null)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => { deleteMutation.mutate(job.id); setConfirmingDeleteId(null) }}
                              disabled={deleteMutation.isPending}
                              className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(job.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                            aria-label="Delete job"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
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
