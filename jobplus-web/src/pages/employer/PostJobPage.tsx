import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Briefcase, MapPin, DollarSign, FileText, CheckCircle2, Building2, ArrowRight } from 'lucide-react'
import { postJobSchema, type PostJobSchema } from '@/schemas/jobSchemas'
import { createJob } from '@/api/jobs'
import { getMyCompany } from '@/api/companies'

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']
const EXPERIENCE_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'MANAGER']

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-500">{message}</p>
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-white/10 dark:bg-white/5">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function PostJobPage() {
  const navigate = useNavigate()

  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['my-company'],
    queryFn: getMyCompany,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<PostJobSchema>({
    resolver: zodResolver(postJobSchema),
  })

  const watchedFields = watch()
  const filledCount = [
    watchedFields.title,
    watchedFields.employmentType,
    watchedFields.experienceLevel,
    watchedFields.description,
  ].filter(Boolean).length
  const completionPct = Math.round((filledCount / 4) * 100)

  const { mutate, isPending, error: mutError } = useMutation({
    mutationFn: (data: PostJobSchema) =>
      createJob({
        title: data.title,
        description: data.description,
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        location: data.location,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
        deadline: data.deadline || undefined,
      }),
    onSuccess: () => navigate('/employer/jobs'),
  })

  function onSubmit(data: PostJobSchema) {
    mutate(data)
  }

  const apiError =
    (mutError as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
    (mutError ? 'Failed to create job. Please try again.' : null)

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set up your company first</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              You need a company profile before you can post jobs. It only takes a minute.
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
    <PageTransition className="min-h-screen bg-slate-50 pb-28 dark:bg-surface-dark">
      <div className="border-b border-slate-200/60 bg-white px-4 py-5 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Post a New Job</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Fill in the details below to attract the right candidates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        {/* Section 1 — Basics */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SectionCard title="Job Basics" icon={Briefcase}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g. Senior React Developer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('employmentType')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select type…</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
                <FieldError message={errors.employmentType?.message} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('experienceLevel')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select level…</option>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <FieldError message={errors.experienceLevel?.message} />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Location</span>
                </label>
                <input
                  {...register('location')}
                  placeholder="e.g. New York, NY or Remote"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Section 2 — Compensation */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SectionCard title="Compensation" icon={DollarSign}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Min Salary ($)
                </label>
                <input
                  type="number"
                  {...register('salaryMin')}
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Max Salary ($)
                </label>
                <input
                  type="number"
                  {...register('salaryMax')}
                  placeholder="90000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Deadline
                </label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Section 3 — Description */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title="Job Description" icon={FileText}>
            <textarea
              {...register('description')}
              rows={10}
              placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
            />
            <FieldError message={errors.description?.message} />
          </SectionCard>
        </motion.div>

        {apiError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {apiError}
          </div>
        )}
      </form>

      {/* Sticky progress bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Completion</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{completionPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <motion.button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending || !isDirty}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isPending ? 'Posting…' : 'Post Job'}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}
