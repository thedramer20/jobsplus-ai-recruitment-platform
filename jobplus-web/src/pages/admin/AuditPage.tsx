import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { getAuditLog } from '@/api/admin'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageTransition } from '@/components/layout/PageTransition'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
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

export default function AdminAuditPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-audit', page],
    queryFn: () => getAuditLog({ page, size: 50 }),
  })

  return (
    <PageTransition>
    <PageContainer size="full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Read-only record of all administrative actions taken on the platform.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Target Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Target ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Detail
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
                        {error instanceof Error ? error.message : 'Failed to load audit log'}
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
                      <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">No data yet</p>
                    </div>
                  </td>
                </tr>
              ) : data?.content.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {entry.adminName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {entry.targetType ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {entry.targetId ?? '—'}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-500 dark:text-slate-400">
                      <span title={entry.detail ?? ''}>
                        {entry.detail
                          ? entry.detail.length > 80
                            ? `${entry.detail.slice(0, 80)}…`
                            : entry.detail
                          : '—'}
                      </span>
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
