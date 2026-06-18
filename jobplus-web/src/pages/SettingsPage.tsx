import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Bell, Palette, Shield, AlertTriangle, Eye,
  Sun, Moon, Monitor, Camera, Globe, Download, ChevronDown,
  CheckCircle2, Briefcase, GraduationCap, Tag, Plus, Trash2, FileText, type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  updateUser, updateProfile, uploadAvatar, getProfile, uploadResume,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  addSkill, createSkill, removeSkill, getAllSkills,
  type ExperienceItem, type EducationItem, type SkillItem,
  type ExperiencePayload, type EducationPayload,
} from '@/api/profile'
import { changeEmail as changeEmailApi } from '@/api/auth'
import { getSettings, updateSettings, DEFAULT_SETTINGS, type UserSettings } from '@/api/settings'
import apiClient, { getApiErrorMessage } from '@/api/client'
import type { ApiResponse } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionId = 'profile' | 'account' | 'privacy' | 'notifications' | 'appearance' | 'security' | 'danger'
type Visibility = 'public' | 'connections' | 'private'
type MessagingPref = 'everyone' | 'connections' | 'nobody'

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_SECTIONS: Array<{ id: SectionId; labelKey: string; icon: LucideIcon; color: string }> = [
  { id: 'profile',       labelKey: 'settings.sections.profile',       icon: User,    color: 'text-indigo-500' },
  { id: 'account',       labelKey: 'settings.sections.account',       icon: Lock,    color: 'text-violet-500' },
  { id: 'privacy',       labelKey: 'settings.sections.privacy',       icon: Eye,     color: 'text-blue-500'   },
  { id: 'notifications', labelKey: 'settings.sections.notifications', icon: Bell,    color: 'text-amber-500'  },
  { id: 'appearance',    labelKey: 'settings.sections.appearance',    icon: Palette, color: 'text-pink-500'   },
  { id: 'security',      labelKey: 'settings.sections.security',      icon: Shield,  color: 'text-emerald-500'},
]

const DEMO_SESSION = { device: 'Windows · Chrome', location: 'Current session', time: 'Active now' }

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)',          dir: 'ltr' as const },
  { code: 'ar',    label: 'العربية — Arabic',       dir: 'rtl' as const },
  { code: 'fr',    label: 'Français — French',      dir: 'ltr' as const },
  { code: 'es',    label: 'Español — Spanish',      dir: 'ltr' as const },
  { code: 'de',    label: 'Deutsch — German',       dir: 'ltr' as const },
  { code: 'pt',    label: 'Português — Portuguese', dir: 'ltr' as const },
  { code: 'zh',    label: '中文 — Chinese',           dir: 'ltr' as const },
  { code: 'ja',    label: '日本語 — Japanese',         dir: 'ltr' as const },
]

const LANG_KEY = 'jobplus_lang'

function getSavedLang(): string {
  try {
    const raw = localStorage.getItem(LANG_KEY)
    return raw ? (JSON.parse(raw) as { code: string }).code : 'en-US'
  } catch { return 'en-US' }
}

function applyLang(code: string, dir: 'ltr' | 'rtl') {
  document.documentElement.lang = code
  document.documentElement.dir  = dir
  localStorage.setItem(LANG_KEY, JSON.stringify({ code, dir }))
}

// ── Shared primitives ─────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/8'
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'
const errorCls = 'text-xs text-red-500 mt-1.5 flex items-center gap-1'

function SaveButton({ loading, label = 'Save Changes' }: { loading?: boolean; label?: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:shadow-md hover:shadow-indigo-500/30 disabled:opacity-50"
    >
      {loading ? 'Saving…' : label}
    </motion.button>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      aria-label={label ?? 'Toggle setting'}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function ToggleRow({ label, description, checked, onChange, badge }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; badge?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3.5 last:border-0 dark:border-white/5">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
          {badge && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-white/10 dark:text-slate-500">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

function RadioGroup<T extends string>({ label, options, value, onChange }: {
  label: string
  options: Array<{ value: T; label: string; description?: string }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
              value === opt.value
                ? 'border-indigo-300 bg-indigo-50/80 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.03]'
            }`}
          >
            <span className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              value === opt.value ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-500'
            }`}>
              {value === opt.value && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
            </span>
            <div>
              <p className={`text-sm font-medium ${value === opt.value ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {opt.label}
              </p>
              {opt.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{opt.description}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle, icon: Icon, iconColor = 'text-indigo-500', iconBg = 'bg-indigo-50 dark:bg-indigo-500/10' }: {
  title: string; subtitle?: string; icon?: LucideIcon; iconColor?: string; iconBg?: string
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      {Icon && (
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} size={18} />
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  )
}

function Divider() {
  return <div className="my-6 border-t border-slate-100 dark:border-white/[0.06]" />
}

function CardSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      <div className="px-4">{children}</div>
    </div>
  )
}

function SettingsSubsection({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: {
  title: string
  subtitle?: string
  icon: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-white/10 dark:text-indigo-300">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ExperienceEditor({
  initial,
  loading,
  onSave,
  onCancel,
}: {
  initial?: Partial<ExperiencePayload>
  loading: boolean
  onSave: (data: ExperiencePayload) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<ExperiencePayload>({
    title: initial?.title ?? '',
    companyName: initial?.companyName ?? '',
    location: initial?.location ?? null,
    startDate: initial?.startDate ?? null,
    endDate: initial?.endDate ?? null,
    current: initial?.current ?? false,
    description: initial?.description ?? null,
  })

  const set = (key: keyof ExperiencePayload, value: ExperiencePayload[keyof ExperiencePayload]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/40">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Job Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Frontend Developer" />
        </div>
        <div>
          <label className={labelCls}>Company</label>
          <input className={inputCls} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="TechVentures" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Location</label>
        <input className={inputCls} value={form.location ?? ''} onChange={(e) => set('location', e.target.value || null)} placeholder="Jinhua or Remote" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Start Date</label>
          <input title="Experience start date" type="date" className={inputCls} value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value || null)} />
        </div>
        <div>
          <label className={labelCls}>End Date</label>
          <input title="Experience end date" type="date" className={inputCls} value={form.endDate ?? ''} disabled={!!form.current} onChange={(e) => set('endDate', e.target.value || null)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={!!form.current}
          onChange={(e) => {
            set('current', e.target.checked)
            if (e.target.checked) set('endDate', null)
          }}
          className="rounded border-slate-300 accent-indigo-600"
        />
        I currently work here
      </label>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${inputCls} min-h-[90px] resize-none`}
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value || null)}
          placeholder="Describe what you achieved, not only what you were responsible for."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={loading || !form.title || !form.companyName}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
          Cancel
        </button>
      </div>
    </div>
  )
}

function EducationEditor({
  initial,
  loading,
  onSave,
  onCancel,
}: {
  initial?: Partial<EducationPayload>
  loading: boolean
  onSave: (data: EducationPayload) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<EducationPayload>({
    school: initial?.school ?? '',
    degree: initial?.degree ?? null,
    fieldOfStudy: initial?.fieldOfStudy ?? null,
    startYear: initial?.startYear ?? null,
    endYear: initial?.endYear ?? null,
  })

  const set = (key: keyof EducationPayload, value: EducationPayload[keyof EducationPayload]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/40">
      <div>
        <label className={labelCls}>School</label>
        <input className={inputCls} value={form.school} onChange={(e) => set('school', e.target.value)} placeholder="Your university or college" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Degree</label>
          <input className={inputCls} value={form.degree ?? ''} onChange={(e) => set('degree', e.target.value || null)} placeholder="Bachelor of Science" />
        </div>
        <div>
          <label className={labelCls}>Field of Study</label>
          <input className={inputCls} value={form.fieldOfStudy ?? ''} onChange={(e) => set('fieldOfStudy', e.target.value || null)} placeholder="Computer Science" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Start Year</label>
          <input title="Education start year" type="number" className={inputCls} value={form.startYear ?? ''} onChange={(e) => set('startYear', e.target.value ? Number(e.target.value) : null)} placeholder="2021" />
        </div>
        <div>
          <label className={labelCls}>End Year</label>
          <input title="Education end year" type="number" className={inputCls} value={form.endYear ?? ''} onChange={(e) => set('endYear', e.target.value ? Number(e.target.value) : null)} placeholder="2025" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={loading || !form.school}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Profile Section ───────────────────────────────────────────────────────────

const profileSchema = z.object({
  name:     z.string().min(1, 'Name is required'),
  headline: z.string().optional(),
  location: z.string().optional(),
  bio:      z.string().max(300, 'Max 300 characters').optional(),
})
type ProfileFormData = z.infer<typeof profileSchema>

function ProfileSection() {
  const user      = useAuthStore((s) => s.user)
  const patchUser = useAuthStore((s) => s.patchUser)
  const addToast  = useUIStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [addingExperience, setAddingExperience] = useState(false)
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null)
  const [addingEducation, setAddingEducation] = useState(false)
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null)
  const [skillSearch, setSkillSearch] = useState('')

  const { data: profileData } = useQuery({
    queryKey: ['settings-profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
  })

  const { data: allSkills = [] } = useQuery({
    queryKey: ['skills', 'all'],
    queryFn: getAllSkills,
    staleTime: 5 * 60 * 1000,
  })

  const experiences = profileData?.experiences ?? []
  const educations = profileData?.educations ?? []
  const skills = profileData?.skills ?? []
  const existingSkillIds = new Set(skills.map((skill) => skill.id))
  const normalizedSkillSearch = skillSearch.trim()
  const exactSkillMatch = allSkills.find(
    (skill) => skill.name.trim().toLowerCase() === normalizedSkillSearch.toLowerCase(),
  )
  const canCreateSkill = normalizedSkillSearch.length > 0 && !exactSkillMatch
  const filteredAvailableSkills = allSkills.filter(
    (skill) => !existingSkillIds.has(skill.id) && skill.name.toLowerCase().includes(skillSearch.toLowerCase()),
  )

  function invalidateProfileData() {
    if (!user?.id) return
    void queryClient.invalidateQueries({ queryKey: ['settings-profile', user.id] })
    void queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
    void queryClient.invalidateQueries({ queryKey: ['ai'] })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { addToast('Image must be under 2MB', 'error'); return }
    setAvatarUploading(true)
    try {
      const { avatarUrl } = await uploadAvatar(file)
      patchUser({ avatarUrl })
      addToast('Profile photo updated', 'success')
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Avatar upload failed', 'error')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { addToast('Resume must be under 5MB', 'error'); return }
    setResumeUploading(true)
    try {
      await uploadResume(file)
      invalidateProfileData()
      addToast('Resume uploaded', 'success')
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Resume upload failed', 'error')
    } finally {
      setResumeUploading(false)
    }
  }

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', headline: user?.headline ?? '', location: user?.location ?? '', bio: '' },
  })
  const bio = watch('bio') ?? ''

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      headline: user?.headline ?? '',
      location: user?.location ?? '',
      bio: profileData?.bio ?? '',
    })
  }, [user?.name, user?.headline, user?.location, profileData?.bio, reset])

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await updateUser({ name: data.name, headline: data.headline || undefined, location: data.location || undefined })
      await updateProfile({ bio: data.bio || undefined })
    },
    onSuccess: () => {
      invalidateProfileData()
      addToast('Profile saved', 'success')
    },
    onError:   () => addToast('Failed to save profile', 'error'),
  })

  const addExperienceMutation = useMutation({
    mutationFn: addExperience,
    onSuccess: () => {
      invalidateProfileData()
      setAddingExperience(false)
      addToast('Experience added', 'success')
    },
    onError: () => addToast('Failed to add experience', 'error'),
  })

  const updateExperienceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExperiencePayload }) => updateExperience(id, data),
    onSuccess: () => {
      invalidateProfileData()
      setEditingExperienceId(null)
      addToast('Experience updated', 'success')
    },
    onError: () => addToast('Failed to update experience', 'error'),
  })

  const deleteExperienceMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      invalidateProfileData()
      addToast('Experience deleted', 'success')
    },
    onError: () => addToast('Failed to delete experience', 'error'),
  })

  const addEducationMutation = useMutation({
    mutationFn: addEducation,
    onSuccess: () => {
      invalidateProfileData()
      setAddingEducation(false)
      addToast('Education added', 'success')
    },
    onError: () => addToast('Failed to add education', 'error'),
  })

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EducationPayload }) => updateEducation(id, data),
    onSuccess: () => {
      invalidateProfileData()
      setEditingEducationId(null)
      addToast('Education updated', 'success')
    },
    onError: () => addToast('Failed to update education', 'error'),
  })

  const deleteEducationMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      invalidateProfileData()
      addToast('Education deleted', 'success')
    },
    onError: () => addToast('Failed to delete education', 'error'),
  })

  const addSkillMutation = useMutation({
    mutationFn: addSkill,
    onSuccess: () => {
      invalidateProfileData()
      setSkillSearch('')
      addToast('Skill added', 'success')
    },
    onError: () => addToast('Failed to add skill', 'error'),
  })

  const createSkillMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      invalidateProfileData()
      void queryClient.invalidateQueries({ queryKey: ['skills', 'all'] })
      setSkillSearch('')
      addToast('Skill added', 'success')
    },
    onError: () => addToast('Failed to create skill', 'error'),
  })

  const removeSkillMutation = useMutation({
    mutationFn: removeSkill,
    onSuccess: () => {
      invalidateProfileData()
      addToast('Skill removed', 'success')
    },
    onError: () => addToast('Failed to remove skill', 'error'),
  })

  return (
    <div>
      <SectionHeader title="Profile" subtitle="Your public profile visible to other members." icon={User} />

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="relative flex-shrink-0">
          <Avatar src={user?.avatarUrl ?? null} name={user?.name ?? ''} size="xl" />
          <button
            type="button"
            aria-label="Upload profile photo"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-gradient-to-br from-indigo-600 to-violet-600 p-1.5 text-white shadow disabled:opacity-60 dark:border-slate-900"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upload a photo to personalize your profile</p>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="mt-1.5 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-60 dark:text-indigo-400"
          >
            {avatarUploading ? 'Uploading…' : 'Change photo →'}
          </button>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleAvatarChange}
          className="hidden"
          aria-label="Upload profile photo"
          title="Upload profile photo"
        />
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Full Name</label>
            <input {...register('name')} className={inputCls} placeholder="Your full name" />
            {errors.name && <p className={errorCls}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input {...register('location')} className={inputCls} placeholder="e.g. San Francisco, CA" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Professional Headline</label>
          <input {...register('headline')} className={inputCls} placeholder="e.g. Senior Software Engineer at Acme" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
            <span className={`text-xs ${bio.length > 280 ? 'text-red-500' : 'text-slate-400'}`}>{bio.length}/300</span>
          </div>
          <textarea {...register('bio')} className={`${inputCls} min-h-[88px] resize-none`} placeholder="Write a short bio about yourself…" />
          {errors.bio && <p className={errorCls}>{errors.bio.message}</p>}
        </div>
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <label className="text-sm font-medium text-slate-400 dark:text-slate-500">Website</label>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-white/10">Coming soon</span>
          </div>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
            <input disabled className={`${inputCls} cursor-not-allowed pl-10 opacity-40`} placeholder="https://yourwebsite.com" />
          </div>
        </div>
        <SaveButton loading={mutation.isPending} label="Save Profile" />
      </form>

      <Divider />

      <div className="space-y-4">
        <SettingsSubsection
          title="Resume"
          subtitle="Upload your resume here so the AI analyzer, applications, and profile all stay in sync."
          icon={FileText}
          action={
            <button
              type="button"
              onClick={() => resumeInputRef.current?.click()}
              disabled={resumeUploading}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-60 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {resumeUploading ? 'Uploading…' : profileData?.resumeUrl ? 'Replace resume' : 'Upload resume'}
            </button>
          }
        >
          {profileData?.resumeUrl ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={profileData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200"
              >
                {profileData.resumeUrl.split('/').pop()}
              </a>
              <p className="text-xs text-slate-500 dark:text-slate-400">Used by AI Resume Analyzer and apply flow.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No resume uploaded yet.</p>
          )}
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="hidden"
            aria-label="Upload resume"
            title="Upload resume"
          />
        </SettingsSubsection>

        <SettingsSubsection
          title="Skills"
          subtitle="Add role-relevant skills so matching and AI scoring become more accurate."
          icon={Tag}
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Add a skill</label>
              <input
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (exactSkillMatch && !existingSkillIds.has(exactSkillMatch.id)) {
                    addSkillMutation.mutate(exactSkillMatch.id)
                    return
                  }
                  if (canCreateSkill) createSkillMutation.mutate(normalizedSkillSearch)
                }}
                className={inputCls}
                placeholder="Search or type a new skill..."
              />
            </div>

            {canCreateSkill && (
              <button
                type="button"
                onClick={() => createSkillMutation.mutate(normalizedSkillSearch)}
                disabled={createSkillMutation.isPending}
                className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
              >
                <Plus className="h-3.5 w-3.5" />
                {createSkillMutation.isPending ? 'Adding...' : `Add "${normalizedSkillSearch}"`}
              </button>
            )}

            {filteredAvailableSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filteredAvailableSkills.slice(0, 12).map((skill: SkillItem) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addSkillMutation.mutate(skill.id)}
                    disabled={addSkillMutation.isPending}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            )}

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: SkillItem) => (
                  <span
                    key={skill.id}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkillMutation.mutate(skill.id)}
                      className="text-slate-400 transition hover:text-red-500"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
            )}
          </div>
        </SettingsSubsection>

        <SettingsSubsection
          title="Experience"
          subtitle="Add internships, projects, freelance work, or full-time roles to strengthen your profile."
          icon={Briefcase}
          action={
            !addingExperience ? (
              <button
                type="button"
                onClick={() => {
                  setAddingExperience(true)
                  setEditingExperienceId(null)
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add experience
              </button>
            ) : undefined
          }
        >
          <div className="space-y-3">
            {addingExperience && (
              <ExperienceEditor
                loading={addExperienceMutation.isPending}
                onSave={(data) => addExperienceMutation.mutate(data)}
                onCancel={() => setAddingExperience(false)}
              />
            )}

            {experiences.length === 0 && !addingExperience && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No experience added yet.</p>
            )}

            {experiences.map((item: ExperienceItem) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/40">
                {editingExperienceId === item.id ? (
                  <ExperienceEditor
                    initial={item}
                    loading={updateExperienceMutation.isPending}
                    onSave={(data) => updateExperienceMutation.mutate({ id: item.id, data })}
                    onCancel={() => setEditingExperienceId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">{item.companyName}{item.location ? ` · ${item.location}` : ''}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {item.startDate ?? 'Start date not set'}{item.current ? ' - Present' : item.endDate ? ` - ${item.endDate}` : ''}
                      </p>
                      {item.description && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExperienceId(item.id)
                          setAddingExperience(false)
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExperienceMutation.mutate(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SettingsSubsection>

        <SettingsSubsection
          title="Education"
          subtitle="Add your school, degree, and field of study so your profile is complete."
          icon={GraduationCap}
          action={
            !addingEducation ? (
              <button
                type="button"
                onClick={() => {
                  setAddingEducation(true)
                  setEditingEducationId(null)
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add education
              </button>
            ) : undefined
          }
        >
          <div className="space-y-3">
            {addingEducation && (
              <EducationEditor
                loading={addEducationMutation.isPending}
                onSave={(data) => addEducationMutation.mutate(data)}
                onCancel={() => setAddingEducation(false)}
              />
            )}

            {educations.length === 0 && !addingEducation && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No education added yet.</p>
            )}

            {educations.map((item: EducationItem) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/40">
                {editingEducationId === item.id ? (
                  <EducationEditor
                    initial={item}
                    loading={updateEducationMutation.isPending}
                    onSave={(data) => updateEducationMutation.mutate({ id: item.id, data })}
                    onCancel={() => setEditingEducationId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.school}</p>
                      {(item.degree || item.fieldOfStudy) && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-300">
                          {[item.degree, item.fieldOfStudy].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {(item.startYear || item.endYear) && (
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {item.startYear ?? ''}{item.endYear ? ` - ${item.endYear}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEducationId(item.id)
                          setAddingEducation(false)
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEducationMutation.mutate(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SettingsSubsection>
      </div>
    </div>
  )
}

// ── Account Section ───────────────────────────────────────────────────────────

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
type PasswordFormData = z.infer<typeof passwordSchema>

function changePassword(body: { currentPassword: string; newPassword: string }): Promise<unknown> {
  return apiClient.patch<ApiResponse<unknown>>('/auth/change-password', body).then((r) => r.data.data)
}

function AccountSection() {
  const user     = useAuthStore((s) => s.user)
  const setUser  = useAuthStore((s) => s.setUser)
  const addToast = useUIStore((s) => s.addToast)
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => { addToast('Password changed', 'success'); reset() },
    onError:   () => setError('currentPassword', { message: 'Incorrect current password' }),
  })

  // ── Email change ──
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const emailMutation = useMutation({
    mutationFn: () => changeEmailApi({ currentPassword: emailPassword, newEmail }),
    onSuccess: (res) => {
      setUser(res.user, res.accessToken, res.refreshToken)
      addToast('Email updated', 'success')
      setShowEmailForm(false)
      setNewEmail('')
      setEmailPassword('')
    },
    onError: (err) => addToast(getApiErrorMessage(err) || 'Could not update email', 'error'),
  })

  return (
    <div>
      <SectionHeader title="Account" subtitle="Manage your email address and password." icon={Lock} iconColor="text-violet-500" iconBg="bg-violet-50 dark:bg-violet-500/10" />

      <div className="mb-2 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email address</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{user?.email ?? '—'}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      </div>

      {showEmailForm ? (
        <form
          onSubmit={(e) => { e.preventDefault(); emailMutation.mutate() }}
          className="mb-6 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]"
        >
          <div>
            <label className={labelCls}>New email address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              required
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={emailMutation.isPending || !newEmail || !emailPassword}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {emailMutation.isPending ? 'Updating…' : 'Update email'}
            </button>
            <button
              type="button"
              onClick={() => { setShowEmailForm(false); setNewEmail(''); setEmailPassword('') }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowEmailForm(true)}
          className="mb-6 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Change email address →
        </button>
      )}

      <Divider />
      <p className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-300">Change Password</p>

      <form onSubmit={handleSubmit((d) => mutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }))} className="space-y-4">
        <div>
          <label className={labelCls}>Current Password</label>
          <input {...register('currentPassword')} type="password" className={inputCls} placeholder="••••••••" autoComplete="current-password" />
          {errors.currentPassword && <p className={errorCls}>{errors.currentPassword.message}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>New Password</label>
            <input {...register('newPassword')} type="password" className={inputCls} placeholder="Min. 8 characters" autoComplete="new-password" />
            {errors.newPassword && <p className={errorCls}>{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input {...register('confirmPassword')} type="password" className={inputCls} placeholder="Repeat new password" autoComplete="new-password" />
            {errors.confirmPassword && <p className={errorCls}>{errors.confirmPassword.message}</p>}
          </div>
        </div>
        <SaveButton loading={isSubmitting || mutation.isPending} label="Update Password" />
      </form>
    </div>
  )
}

// ── Settings persistence hook ──────────────────────────────────────────────────

function useSettings() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings })

  const settings: UserSettings = {
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(data?.privacy ?? {}) },
    notifications: {
      email: { ...DEFAULT_SETTINGS.notifications.email, ...(data?.notifications?.email ?? {}) },
      push:  { ...DEFAULT_SETTINGS.notifications.push,  ...(data?.notifications?.push ?? {}) },
    },
  }

  const mutation = useMutation({
    mutationFn: (next: UserSettings) => updateSettings(next),
    onSuccess: (saved) => queryClient.setQueryData(['settings'], saved),
  })

  return { settings, isLoaded: !isLoading && data !== undefined, mutation }
}

// ── Privacy Section ───────────────────────────────────────────────────────────

function PrivacySection() {
  const addToast = useUIStore((s) => s.addToast)
  const { settings, isLoaded, mutation } = useSettings()
  const [visibility, setVisibility]         = useState<Visibility>(DEFAULT_SETTINGS.privacy.visibility)
  const [messaging, setMessaging]           = useState<MessagingPref>(DEFAULT_SETTINGS.privacy.messaging)
  const [showInSearch, setShowInSearch]     = useState(DEFAULT_SETTINGS.privacy.showInSearch)
  const [showConnections, setShowConnections] = useState(DEFAULT_SETTINGS.privacy.showConnections)
  const hydrated = useRef(false)

  useEffect(() => {
    if (isLoaded && !hydrated.current) {
      hydrated.current = true
      setVisibility(settings.privacy.visibility)
      setMessaging(settings.privacy.messaging)
      setShowInSearch(settings.privacy.showInSearch)
      setShowConnections(settings.privacy.showConnections)
    }
  }, [isLoaded, settings.privacy])

  function handleSave() {
    mutation.mutate(
      { ...settings, privacy: { visibility, messaging, showInSearch, showConnections } },
      {
        onSuccess: () => addToast('Privacy settings saved', 'success'),
        onError: () => addToast('Could not save privacy settings', 'error'),
      },
    )
  }

  return (
    <div>
      <SectionHeader title="Privacy" subtitle="Control who can see your profile and contact you." icon={Eye} iconColor="text-blue-500" iconBg="bg-blue-50 dark:bg-blue-500/10" />
      <div className="space-y-6">
        <RadioGroup<Visibility>
          label="Profile Visibility"
          value={visibility}
          onChange={setVisibility}
          options={[
            { value: 'public',      label: 'Public',           description: 'Anyone on JobPlus can see your full profile' },
            { value: 'connections', label: 'Connections only', description: 'Only your connections can view your profile'  },
            { value: 'private',     label: 'Private',          description: 'Only you can see your profile'               },
          ]}
        />
        <RadioGroup<MessagingPref>
          label="Who can message you"
          value={messaging}
          onChange={setMessaging}
          options={[
            { value: 'everyone',    label: 'Everyone',         description: 'Any member can send you a message'        },
            { value: 'connections', label: 'Connections only', description: 'Only your connections can message you'    },
            { value: 'nobody',      label: 'No one',           description: 'Turn off all incoming messages'           },
          ]}
        />
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Discoverability</p>
          <CardSection>
            <ToggleRow label="Show profile in search results" description="Allow your profile to appear in JobPlus search" checked={showInSearch} onChange={setShowInSearch} />
            <ToggleRow label="Show connections list" description="Let others see who you're connected with" checked={showConnections} onChange={setShowConnections} />
          </CardSection>
        </div>
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={mutation.isPending}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:shadow-md disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : 'Save Privacy Settings'}
        </motion.button>
      </div>
    </div>
  )
}

// ── Notifications Section ─────────────────────────────────────────────────────

function NotificationsSection() {
  const addToast = useUIStore((s) => s.addToast)
  const { settings, isLoaded, mutation } = useSettings()
  const [email, setEmail] = useState(DEFAULT_SETTINGS.notifications.email)
  const [push,  setPush]  = useState(DEFAULT_SETTINGS.notifications.push)
  const setE = (key: keyof typeof email) => (v: boolean) => setEmail((e) => ({ ...e, [key]: v }))
  const setP = (key: keyof typeof push)  => (v: boolean) => setPush((p)  => ({ ...p, [key]: v }))
  const hydrated = useRef(false)

  useEffect(() => {
    if (isLoaded && !hydrated.current) {
      hydrated.current = true
      setEmail(settings.notifications.email)
      setPush(settings.notifications.push)
    }
  }, [isLoaded, settings.notifications])

  function handleSave() {
    mutation.mutate(
      { ...settings, notifications: { email, push } },
      {
        onSuccess: () => addToast('Notification preferences saved', 'success'),
        onError: () => addToast('Could not save preferences', 'error'),
      },
    )
  }

  return (
    <div>
      <SectionHeader title="Notifications" subtitle="Choose which updates you want to receive." icon={Bell} iconColor="text-amber-500" iconBg="bg-amber-50 dark:bg-amber-500/10" />
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Email Notifications</p>
          <CardSection>
            <ToggleRow label="New connection requests"  description="Someone wants to connect with you"         checked={email.connections}        onChange={setE('connections')}        />
            <ToggleRow label="Messages"                 description="When you receive a new message"             checked={email.messages}           onChange={setE('messages')}           />
            <ToggleRow label="Job matches"              description="New jobs matching your profile"             checked={email.jobMatches}         onChange={setE('jobMatches')}         />
            <ToggleRow label="Application updates"      description="Status changes on your job applications"   checked={email.applicationUpdates} onChange={setE('applicationUpdates')} />
            <ToggleRow label="Company updates"          description="News from companies you follow"            checked={email.companyUpdates}     onChange={setE('companyUpdates')}     />
            <ToggleRow label="Weekly digest"            description="A weekly summary of relevant activity"     checked={email.weeklyDigest}       onChange={setE('weeklyDigest')}       />
          </CardSection>
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Push Notifications</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-white/10 dark:text-slate-500">Coming soon</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 opacity-50 dark:border-white/10">
            <div className="px-4">
              <ToggleRow label="Connection requests" checked={push.connections} onChange={setP('connections')} />
              <ToggleRow label="New messages"        checked={push.messages}    onChange={setP('messages')}    />
              <ToggleRow label="Job matches"         checked={push.jobMatches}  onChange={setP('jobMatches')}  />
            </div>
          </div>
        </div>
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={mutation.isPending}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:shadow-md disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : 'Save Preferences'}
        </motion.button>
      </div>
    </div>
  )
}

// ── Appearance Section ────────────────────────────────────────────────────────

function AppearanceSection() {
  const theme    = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const addToast = useUIStore((s) => s.addToast)
  const [compactMode, setCompactMode] = useState(false)
  const [langCode, setLangCode]       = useState(getSavedLang)
  const { t, i18n } = useTranslation()

  function handleLangChange(code: string) {
    const lang = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
    setLangCode(code)
    applyLang(lang.code, lang.dir)
    void i18n.changeLanguage(code)
    const shortLabel = lang.label.includes('—') ? lang.label.split('—')[0].trim() : lang.label
    addToast(`Language changed to ${shortLabel}`, 'success')
  }

  const themeOptions = [
    { value: 'light'  as const, icon: Sun,     labelKey: 'settings.appearance.light',  descKey: 'settings.appearance.lightDesc',  gradient: 'from-amber-400 to-orange-500'  },
    { value: 'dark'   as const, icon: Moon,    labelKey: 'settings.appearance.dark',   descKey: 'settings.appearance.darkDesc',   gradient: 'from-indigo-500 to-violet-600' },
    { value: 'system' as const, icon: Monitor, labelKey: 'settings.appearance.system', descKey: 'settings.appearance.systemDesc', gradient: 'from-slate-400 to-slate-600'   },
  ]

  return (
    <div>
      <SectionHeader title={t('settings.appearance.title')} subtitle={t('settings.appearance.subtitle')} icon={Palette} iconColor="text-pink-500" iconBg="bg-pink-50 dark:bg-pink-500/10" />
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{t('settings.appearance.theme')}</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon     = opt.icon
              const selected = theme === opt.value
              return (
                <motion.button
                  type="button"
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    selected
                      ? 'border-indigo-400 bg-indigo-50/80 dark:border-indigo-500/60 dark:bg-indigo-500/10'
                      : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                  }`}
                >
                  <div className={`mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${opt.gradient}`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className={`text-sm font-semibold ${selected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {t(opt.labelKey)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t(opt.descKey)}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{t('settings.appearance.language')}</p>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              title="Select language"
              aria-label="Select language"
              value={langCode}
              onChange={(e) => handleLangChange(e.target.value)}
              className={`${inputCls} pl-10 pr-9 appearance-none`}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800">{l.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <CardSection>
          <ToggleRow
            label={t('settings.appearance.compactMode')}
            description={t('settings.appearance.compactModeDesc')}
            checked={compactMode}
            onChange={(v) => { setCompactMode(v); addToast(`Compact mode ${v ? 'on' : 'off'}`, 'info') }}
          />
        </CardSection>
      </div>
    </div>
  )
}

// ── Security Section ──────────────────────────────────────────────────────────

function SecuritySection() {
  const addToast = useUIStore((s) => s.addToast)
  const user = useAuthStore((s) => s.user)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!user) return
    setExporting(true)
    try {
      const [profile, settings] = await Promise.all([
        getProfile(user.id),
        getSettings().catch(() => ({})),
      ])
      const payload = {
        exportedAt: new Date().toISOString(),
        account: user,
        profile,
        settings,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jobplus-data-${user.id}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      addToast('Your data has been downloaded', 'success')
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Could not export your data', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Security" subtitle="Manage your account security and active sessions." icon={Shield} iconColor="text-emerald-500" iconBg="bg-emerald-50 dark:bg-emerald-500/10" />
      <div className="space-y-4">

        {/* 2FA */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/[0.07] dark:bg-white/[0.02]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 dark:bg-indigo-500/10">
                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-white/10 dark:text-slate-500">Coming soon</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => addToast('2FA setup coming soon', 'info')}
              className="flex-shrink-0 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
            >
              Set up
            </button>
          </div>
        </div>

        {/* Active sessions */}
        <div>
          <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">Active Sessions</p>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 dark:border-white/[0.07] dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
                <Monitor className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{DEMO_SESSION.device}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{DEMO_SESSION.location} · {DEMO_SESSION.time}</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Current
            </span>
          </div>
          <button
            type="button"
            onClick={() => addToast('Remote sign-out isn’t available yet — this feature is coming soon', 'info')}
            className="mt-2.5 text-xs font-semibold text-red-500 hover:underline"
          >
            Sign out of all other devices →
          </button>
        </div>

        {/* Download data */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 dark:border-white/[0.07] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
              <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Download your data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Get a copy of all data associated with your account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex-shrink-0 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-60 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
          >
            {exporting ? 'Preparing…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Danger Section ────────────────────────────────────────────────────────────

function DangerSection() {
  const addToast = useUIStore((s) => s.addToast)
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  function handleConfirmDelete() {
    setConfirming(false)
    setConfirmText('')
    addToast('Account deletion isn’t available yet — please contact support@jobplus.com', 'info')
  }

  return (
    <div>
      <SectionHeader title="Danger Zone" subtitle="Permanent actions that cannot be undone." icon={AlertTriangle} iconColor="text-red-500" iconBg="bg-red-50 dark:bg-red-500/10" />
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/[0.04]">
        <div className="border-b border-red-200/60 px-4 py-2 dark:border-red-500/10">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">Irreversible Actions</p>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Delete Account</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Permanently removes your account and all data. This cannot be undone.
              </p>
            </div>
          </div>
          {confirming ? (
            <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                aria-label="Type DELETE to confirm account deletion"
                className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-500/30 dark:bg-white/5 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setConfirming(false); setConfirmText('') }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-white dark:border-white/10 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmText !== 'DELETE'}
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Permanently delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex-shrink-0 rounded-xl border border-red-400 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Settings Page ─────────────────────────────────────────────────────────────

const CONTENT_MAP: Record<SectionId, React.ReactNode> = {
  profile:       <ProfileSection />,
  account:       <AccountSection />,
  privacy:       <PrivacySection />,
  notifications: <NotificationsSection />,
  appearance:    <AppearanceSection />,
  security:      <SecuritySection />,
  danger:        <DangerSection />,
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile')
  const { t } = useTranslation()

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-16">
        <div className="mx-auto max-w-5xl px-4 py-8">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t('settings.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings.subtitle')}</p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">

            {/* ── Sidebar nav ── */}
            <nav className="flex gap-1 overflow-x-auto pb-1 no-scrollbar lg:w-56 lg:flex-col lg:overflow-x-visible lg:pb-0">
              <div className="hidden lg:block lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white lg:shadow-sm dark:lg:border-white/[0.07] dark:lg:bg-slate-800/60">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Settings</p>
                </div>
                <div className="p-2">
                  {NAV_SECTIONS.map((s) => {
                    const Icon     = s.icon
                    const isActive = active === s.id
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : s.color + ' opacity-60'}`} />
                        <span className="text-sm font-medium">{t(s.labelKey)}</span>
                        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                      </button>
                    )
                  })}
                  <div className="my-2 border-t border-slate-100 dark:border-white/[0.06]" />
                  <button
                    type="button"
                    onClick={() => setActive('danger')}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      active === 'danger'
                        ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        : 'text-red-500 hover:bg-red-50/70 dark:text-red-500/70 dark:hover:bg-red-500/10'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{t('settings.sections.dangerZone')}</span>
                  </button>
                </div>
              </div>

              {/* Mobile: horizontal scrollable tabs */}
              <div className="flex gap-1 lg:hidden">
                {NAV_SECTIONS.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={`flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active === s.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {t(s.labelKey)}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setActive('danger')}
                  className={`flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active === 'danger' ? 'bg-red-600 text-white' : 'bg-white text-red-500 dark:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Danger
                </button>
              </div>
            </nav>

            {/* ── Content panel ── */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60"
                >
                  {CONTENT_MAP[active]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
