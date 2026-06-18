import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  Building2, Globe, MapPin, Users, FileText, CheckCircle2,
  Sparkles, ExternalLink, Briefcase,
} from 'lucide-react'
import { getMyCompany, createCompany, updateCompany } from '@/api/companies'
import { useUIStore } from '@/store/uiStore'
import type { Company } from '@/types'

const schema = z.object({
  name:        z.string().min(2, 'Company name is required'),
  industry:    z.string().optional(),
  size:        z.string().optional(),
  location:    z.string().optional(),
  website:     z.string().url('Enter a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  logoUrl:     z.string().url('Enter a valid image URL').optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const INDUSTRIES = [
  'Software & Technology', 'Finance & Banking', 'Healthcare', 'Education Technology',
  'E-Commerce & Retail', 'Cloud & Infrastructure', 'Cybersecurity', 'Media & Entertainment',
  'Logistics & Supply Chain', 'Consulting', 'Real Estate', 'Manufacturing', 'Other',
]

const SIZES = [
  { value: 'STARTUP',    label: 'Startup (1–10)' },
  { value: 'SMALL',      label: 'Small (11–50)' },
  { value: 'MEDIUM',     label: 'Medium (51–200)' },
  { value: 'LARGE',      label: 'Large (201–1000)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+)' },
]

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary dark:border-white/10 dark:bg-slate-800 dark:text-white"

export default function CompanyProfilePage() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  const { data: company, isLoading } = useQuery({
    queryKey: ['my-company'],
    queryFn: getMyCompany,
  })

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', industry: '', size: '', location: '', website: '', description: '', logoUrl: '' },
  })

  useEffect(() => {
    if (company) {
      reset({
        name:        company.name ?? '',
        industry:    company.industry ?? '',
        size:        company.size ?? '',
        location:    company.location ?? '',
        website:     company.website ?? '',
        description: company.description ?? '',
        logoUrl:     company.logoUrl ?? '',
      })
    }
  }, [company, reset])

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        name:        data.name,
        industry:    data.industry || undefined,
        size:        data.size || undefined,
        location:    data.location || undefined,
        website:     data.website || undefined,
        description: data.description || undefined,
        logoUrl:     data.logoUrl || undefined,
      }
      return company ? updateCompany(company.id, payload) : createCompany(payload)
    },
    onSuccess: (updated: Company) => {
      queryClient.setQueryData(['my-company'], updated)
      addToast(company ? 'Company profile updated!' : 'Company profile created!', 'success')
      reset({
        name:        updated.name ?? '',
        industry:    updated.industry ?? '',
        size:        updated.size ?? '',
        location:    updated.location ?? '',
        website:     updated.website ?? '',
        description: updated.description ?? '',
        logoUrl:     updated.logoUrl ?? '',
      })
    },
    onError: () => addToast('Failed to save. Please try again.', 'error'),
  })

  const logoUrl = watch('logoUrl')
  const companyName = watch('name')

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
  const item    = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-6 dark:bg-white/5 h-24" />
            ))}
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 pb-16 dark:from-slate-950 dark:to-slate-950">

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-indigo-600 to-purple-700 px-4 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 left-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-8 right-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative mx-auto flex max-w-4xl items-center gap-5">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-16 w-16 rounded-2xl bg-white object-contain p-1 shadow-xl" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white shadow-xl backdrop-blur">
              {companyName?.[0] ?? <Building2 className="h-8 w-8" />}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {companyName || 'Your Company'}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/70">
              {company?.verified && (
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              )}
              {company?.jobCount != null && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {company.jobCount} open jobs
                </span>
              )}
              {!company && (
                <span className="flex items-center gap-1 text-white/60">
                  <Sparkles className="h-3.5 w-3.5" /> Set up your company profile to attract talent
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Basic info */}
            <motion.div variants={item} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Company Identity</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Company Name" error={errors.name?.message} required>
                    <input {...register('name')} placeholder="e.g. Acme Corporation" className={inputCls} />
                  </Field>
                </div>
                <Field label="Industry" error={errors.industry?.message}>
                  <select {...register('industry')} className={selectCls}>
                    <option value="">Select industry…</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Company Size" error={errors.size?.message}>
                  <select {...register('size')} className={selectCls}>
                    <option value="">Select size…</option>
                    {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              </div>
            </motion.div>

            {/* Contact & location */}
            <motion.div variants={item} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Contact & Location</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Location" error={errors.location?.message}>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input {...register('location')} placeholder="e.g. Singapore" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Website" error={errors.website?.message}>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input {...register('website')} placeholder="https://yourcompany.com" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
              </div>
            </motion.div>

            {/* Branding */}
            <motion.div variants={item} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Branding</h2>
              </div>
              <div className="flex flex-wrap items-start gap-4">
                {/* Logo preview */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Field label="Logo URL" error={errors.logoUrl?.message}>
                    <input {...register('logoUrl')} placeholder="https://yourcompany.com/logo.png" className={inputCls} />
                  </Field>
                  <p className="mt-1.5 text-xs text-slate-400">Paste a direct image URL. Square images (200×200 or larger) work best.</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={item} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-white">About the Company</h2>
              </div>
              <Field label="Description" error={errors.description?.message}>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Tell candidates what makes your company a great place to work. Describe your mission, culture, products, and team…"
                  className={`${inputCls} resize-y`}
                />
              </Field>
              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-400">{watch('description')?.length ?? 0} / 1000</span>
              </div>
            </motion.div>

            {/* Team size info */}
            <motion.div variants={item} className="rounded-2xl border border-primary/20 bg-primary/5 p-5 dark:bg-primary/10">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-primary dark:text-indigo-300">Your company profile is public</p>
                  <p className="mt-0.5 text-sm text-primary/70 dark:text-indigo-400">
                    Job seekers will see your company profile when they browse job listings.
                    A complete profile increases application rates by up to 3×.
                  </p>
                  {company && (
                    <a
                      href={`/companies/${company.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-2"
                    >
                      View public page <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Submit */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={mutation.isPending || !isDirty}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {company ? 'Save Changes' : 'Create Company Profile'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </PageTransition>
  )
}
