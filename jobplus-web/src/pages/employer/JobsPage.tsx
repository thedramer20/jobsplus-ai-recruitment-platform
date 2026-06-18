import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Plus, Trash2, Users, Eye, Building2, ArrowRight } from 'lucide-react'
import { getJobs, deleteJob, updateJob } from '@/api/jobs'
import { getMyCompany } from '@/api/companies'
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400',
  REMOVED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export default function EmployerJobsPage() {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['my-company'],
    queryFn: getMyCompany,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['employer-jobs-list', company?.id],
    queryFn: () => getJobs({ size: 100, companyId: company?.id }),
    enabled: company != null,
  })

  const jobs = data?.content ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs-list'] })
      setConfirmDelete(null)
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateJob(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employer-jobs-list'] }),
  })


  if (!isLoadingCompany && !company) {
    return (
      <PageTransition className="min-h-screen bg-slate-50 dark:bg-surface-dark">
        <div className="flex min-h-screen items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-primary/20 bg-white p-8 text-center shadow-xl dark:bg-white/5"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No company profile yet</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Set up your company profile to start posting jobs and managing applicants.
            </p>
            <Link
              to="/employer/company"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50"
            >
              Create Company Profile <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-slate-50 dark:bg-surface-dark">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Jobs</h1>
          <Link
            to="/employer/post-job"
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-4 dark:bg-white/5">
                <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
                <div className="mt-2 h-3 w-1/4 rounded bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">📋</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No jobs posted yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first job listing to start receiving applications.</p>
            <Link
              to="/employer/post-job"
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10">
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Job Title</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 md:table-cell">Posted</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {jobs.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{job.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job.employmentType.replace('_', ' ')} · {job.experienceLevel}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: job.id,
                            status: job.status === 'OPEN' ? 'CLOSED' : 'OPEN',
                          })
                        }
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-75 ${
                          STATUS_COLORS[job.status] ?? STATUS_COLORS.CLOSED
                        }`}
                      >
                        {job.status}
                      </button>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-500 dark:text-slate-400 md:table-cell">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/employer/jobs/${job.id}/applicants`}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10"
                          title="View applicants"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(job.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Job?</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This will permanently remove the job listing and all applications.</p>
            <div className="mt-4 flex gap-2">
              <motion.button
                onClick={() => setConfirmDelete(null)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => deleteMutation.mutate(confirmDelete)}
                disabled={deleteMutation.isPending}
                whileTap={{ scale: 0.97 }}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  )
}
