import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  MapPin, Camera, Pencil, Trash2, Plus, X, Check,
  Briefcase, GraduationCap, Tag, UserPlus, MessageSquare,
  CheckCircle2, Palette, CalendarDays, Newspaper,
  FileText, Upload, Download, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/api/client'
import { PageTransition } from '@/components/layout/PageTransition'
import { useUIStore } from '@/store/uiStore'
import {
  getProfile, updateProfile, addExperience, updateExperience,
  deleteExperience, addEducation, updateEducation, deleteEducation,
  addSkill, createSkill, removeSkill, getAllSkills, updateBannerGradient,
  uploadAvatar, uploadResume,
  type ExperienceItem, type EducationItem, type SkillItem,
  type ExperiencePayload, type EducationPayload,
} from '@/api/profile'
import { sendRequest, cancelRequest, getConnectionStatus } from '@/api/connections'
import { startConversation } from '@/api/messages'
import { getUserPosts, likePost, unlikePost, deletePost } from '@/api/posts'
import PostCard from '@/features/feed/components/PostCard'
import { ResumeAnalyzerCard } from '@/features/ai/components/ResumeAnalyzerCard'
import { Avatar } from '@/components/ui/Avatar'
import { PageContainer } from '@/components/layout/PageContainer'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatJoinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <PageContainer size="md" className="space-y-4 pt-4">
      <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-800">
        <div className="h-48 bg-slate-200 dark:bg-slate-700" />
        <div className="px-6 pb-6">
          <div className="-mt-14 mb-4 h-24 w-24 rounded-full bg-slate-300 ring-[6px] ring-white dark:bg-slate-600 dark:ring-slate-800" />
          <div className="h-6 w-44 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-5 flex gap-8 border-t border-slate-100 pt-4 dark:border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-5 w-8 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
          <div className="mb-4 h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-700/50" />
            <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-700/50" />
          </div>
        </div>
      ))}
    </PageContainer>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white'

const btnPrimary =
  'rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition'

const btnOutline =
  'rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/8 transition'

// ── Experience Form ───────────────────────────────────────────────────────────

interface ExperienceFormProps {
  initial?: Partial<ExperiencePayload>
  onSave: (data: ExperiencePayload) => void
  onCancel: () => void
  loading: boolean
}

function ExperienceForm({ initial, onSave, onCancel, loading }: ExperienceFormProps) {
  const [form, setForm] = useState<ExperiencePayload>({
    title: initial?.title ?? '',
    companyName: initial?.companyName ?? '',
    location: initial?.location ?? null,
    startDate: initial?.startDate ?? null,
    endDate: initial?.endDate ?? null,
    current: initial?.current ?? false,
    description: initial?.description ?? null,
  })
  const set = (k: keyof ExperiencePayload, v: ExperiencePayload[keyof ExperiencePayload]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Title *</label>
          <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Software Engineer" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Company *</label>
          <input className={inputCls} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Acme Corp" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Location</label>
        <input className={inputCls} value={form.location ?? ''} onChange={(e) => set('location', e.target.value || null)} placeholder="New York, NY" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Start Date</label>
          <input type="date" title="Start date" className={inputCls} value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value || null)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">End Date</label>
          <input type="date" title="End date" className={inputCls} value={form.endDate ?? ''} disabled={form.current ?? false} onChange={(e) => set('endDate', e.target.value || null)} />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={form.current ?? false} onChange={(e) => { set('current', e.target.checked); if (e.target.checked) set('endDate', null) }} className="rounded border-slate-300 accent-primary" />
        Currently working here
      </label>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
        <textarea className={`${inputCls} min-h-[80px] resize-none`} value={form.description ?? ''} onChange={(e) => set('description', e.target.value || null)} placeholder="Describe your role…" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(form)} disabled={loading || !form.title || !form.companyName} className={btnPrimary}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className={btnOutline}>Cancel</button>
      </div>
    </div>
  )
}

// ── Education Form ────────────────────────────────────────────────────────────

interface EducationFormProps {
  initial?: Partial<EducationPayload>
  onSave: (data: EducationPayload) => void
  onCancel: () => void
  loading: boolean
}

function EducationForm({ initial, onSave, onCancel, loading }: EducationFormProps) {
  const [form, setForm] = useState<EducationPayload>({
    school: initial?.school ?? '',
    degree: initial?.degree ?? null,
    fieldOfStudy: initial?.fieldOfStudy ?? null,
    startYear: initial?.startYear ?? null,
    endYear: initial?.endYear ?? null,
  })
  const set = (k: keyof EducationPayload, v: EducationPayload[keyof EducationPayload]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">School *</label>
        <input className={inputCls} value={form.school} onChange={(e) => set('school', e.target.value)} placeholder="University of …" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Degree</label>
          <input className={inputCls} value={form.degree ?? ''} onChange={(e) => set('degree', e.target.value || null)} placeholder="Bachelor of Science" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Field of Study</label>
          <input className={inputCls} value={form.fieldOfStudy ?? ''} onChange={(e) => set('fieldOfStudy', e.target.value || null)} placeholder="Computer Science" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Start Year</label>
          <input type="number" className={inputCls} value={form.startYear ?? ''} onChange={(e) => set('startYear', e.target.value ? parseInt(e.target.value) : null)} placeholder="2018" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">End Year</label>
          <input type="number" className={inputCls} value={form.endYear ?? ''} onChange={(e) => set('endYear', e.target.value ? parseInt(e.target.value) : null)} placeholder="2022" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(form)} disabled={loading || !form.school} className={btnPrimary}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className={btnOutline}>Cancel</button>
      </div>
    </div>
  )
}

// ── Skill Picker ──────────────────────────────────────────────────────────────

interface SkillPickerProps {
  existingIds: Set<number>
  onAdd: (skillId: number) => void
  onCreate: (name: string) => void
  onClose: () => void
  isCreating: boolean
}

function SkillPicker({ existingIds, onAdd, onCreate, onClose, isCreating }: SkillPickerProps) {
  const [search, setSearch] = useState('')
  const { data: allSkills = [] } = useQuery({
    queryKey: ['skills', 'all'],
    queryFn: getAllSkills,
    staleTime: 5 * 60 * 1000,
  })
  const filtered = allSkills.filter((s) => !existingIds.has(s.id) && s.name.toLowerCase().includes(search.toLowerCase()))
  const normalizedSearch = search.trim()
  const exactMatch = allSkills.find((s) => s.name.trim().toLowerCase() === normalizedSearch.toLowerCase())
  const canCreate = normalizedSearch.length > 0 && !exactMatch

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add Skill</span>
        <button type="button" aria-label="Close skill picker" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <input
        className={`${inputCls} mb-3`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          if (exactMatch && !existingIds.has(exactMatch.id)) {
            onAdd(exactMatch.id)
            return
          }
          if (canCreate) onCreate(normalizedSearch)
        }}
        placeholder="Search or type a new skill..."
        autoFocus
      />
      {canCreate && (
        <button
          type="button"
          onClick={() => onCreate(normalizedSearch)}
          disabled={isCreating}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/15 disabled:opacity-60"
        >
          <Plus size={14} />
          {isCreating ? 'Adding...' : `Add "${normalizedSearch}"`}
        </button>
      )}
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No skills found</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((skill) => (
              <button key={skill.id} type="button" onClick={() => onAdd(skill.id)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {skill.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gradient presets ──────────────────────────────────────────────────────────

const GRADIENTS = [
  'from-indigo-700 via-indigo-600 to-violet-600',
  'from-violet-700 via-purple-600 to-fuchsia-500',
  'from-emerald-600 via-teal-500 to-cyan-500',
  'from-rose-600 via-pink-500 to-fuchsia-400',
  'from-slate-700 via-slate-600 to-slate-500',
  'from-amber-600 via-orange-500 to-rose-400',
] as const

const DEFAULT_GRADIENT = GRADIENTS[0]

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

// ── Section card wrapper ──────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  action,
  children,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  delay?: number
}) {
  const rm = useReducedMotion()
  return (
    <motion.div
      initial={rm ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay }}
      className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const profileId = parseInt(id ?? '0')
  const currentUser = useAuthStore((s) => s.user)
  const patchUser = useAuthStore((s) => s.patchUser)
  const addToast = useUIStore((s) => s.addToast)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const rm = useReducedMotion()

  const isOwnProfile = currentUser?.id === profileId

  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [addingExp, setAddingExp] = useState(false)
  const [editingExpId, setEditingExpId] = useState<number | null>(null)
  const [addingEdu, setAddingEdu] = useState(false)
  const [editingEduId, setEditingEduId] = useState<number | null>(null)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [showGradientPicker, setShowGradientPicker] = useState(false)
  const [bannerGradient, setBannerGradient] = useState<string>(DEFAULT_GRADIENT)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [confirmDeleteExpId, setConfirmDeleteExpId] = useState<number | null>(null)
  const [confirmDeleteEduId, setConfirmDeleteEduId] = useState<number | null>(null)
  const [connectStatus, setConnectStatus] = useState<'NONE' | 'PENDING' | 'PENDING_RECEIVED' | 'ACCEPTED'>('NONE')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const gradientPickerRef = useRef<HTMLDivElement>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getProfile(profileId),
    enabled: profileId > 0,
  })

  const { data: connectionStatusData } = useQuery({
    queryKey: ['connectionStatus', profileId],
    queryFn: () => getConnectionStatus(profileId),
    enabled: profileId > 0 && !isOwnProfile && !!currentUser,
  })
  useEffect(() => {
    if (connectionStatusData) setConnectStatus(connectionStatusData as typeof connectStatus)
  }, [connectionStatusData])

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', profileId],
    queryFn: () => getUserPosts(profileId, 0, 10),
    enabled: profileId > 0,
  })
  const userPosts = postsData?.content ?? []

  function handleLikeToggle(postId: number, currentlyLiked: boolean) {
    if (!currentUser) return
    currentlyLiked ? unlikePost(postId) : likePost(postId)
  }

  function handleDeletePost(postId: number) {
    deletePost(postId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['userPosts', profileId] }))
      .catch(() => addToast('Failed to delete post', 'error'))
  }

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['profile', profileId] })
    void queryClient.invalidateQueries({ queryKey: ['ai'] })
    if (isOwnProfile) {
      void queryClient.invalidateQueries({ queryKey: ['settings-profile', profileId] })
    }
  }

  useEffect(() => {
    if (profile?.bannerGradient) setBannerGradient(profile.bannerGradient)
  }, [profile?.bannerGradient])

  useEffect(() => {
    if (!showGradientPicker) return
    function handleOutside(e: MouseEvent) {
      if (gradientPickerRef.current && !gradientPickerRef.current.contains(e.target as Node))
        setShowGradientPicker(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showGradientPicker])

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => { invalidate(); setEditingBio(false); addToast('Profile updated', 'success') },
    onError: () => addToast('Failed to save bio', 'error'),
  })
  const addExpMutation = useMutation({
    mutationFn: addExperience,
    onSuccess: () => { invalidate(); setAddingExp(false) },
    onError: () => addToast('Failed to add experience', 'error'),
  })
  const updateExpMutation = useMutation({
    mutationFn: ({ id: expId, data }: { id: number; data: ExperiencePayload }) => updateExperience(expId, data),
    onSuccess: () => { invalidate(); setEditingExpId(null) },
    onError: () => addToast('Failed to update experience', 'error'),
  })
  const deleteExpMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => invalidate(),
    onError: () => addToast('Failed to delete experience', 'error'),
  })
  const addEduMutation = useMutation({
    mutationFn: addEducation,
    onSuccess: () => { invalidate(); setAddingEdu(false) },
    onError: () => addToast('Failed to add education', 'error'),
  })
  const updateEduMutation = useMutation({
    mutationFn: ({ id: eduId, data }: { id: number; data: EducationPayload }) => updateEducation(eduId, data),
    onSuccess: () => { invalidate(); setEditingEduId(null) },
    onError: () => addToast('Failed to update education', 'error'),
  })
  const deleteEduMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => invalidate(),
    onError: () => addToast('Failed to delete education', 'error'),
  })
  const addSkillMutation = useMutation({
    mutationFn: addSkill,
    onSuccess: () => invalidate(),
    onError: () => addToast('Failed to add skill', 'error'),
  })
  const createSkillMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills', 'all'] })
      invalidate()
      setShowSkillPicker(false)
      addToast('Skill added', 'success')
    },
    onError: () => addToast('Failed to create skill', 'error'),
  })
  const removeSkillMutation = useMutation({
    mutationFn: removeSkill,
    onSuccess: () => invalidate(),
    onError: () => addToast('Failed to remove skill', 'error'),
  })
  const gradientMutation = useMutation({
    mutationFn: (gradient: string) => updateBannerGradient(gradient),
    onError: () => {
      setBannerGradient(profile?.bannerGradient ?? DEFAULT_GRADIENT)
      addToast('Failed to save background', 'error')
    },
    onSuccess: () => invalidate(),
  })
  function handleGradientPick(gradient: string) {
    setBannerGradient(gradient)
    setShowGradientPicker(false)
    gradientMutation.mutate(gradient)
  }
  const connectMutation = useMutation({
    mutationFn: () => sendRequest(profileId),
    onSuccess: () => { setConnectStatus('PENDING'); addToast('Connection request sent!', 'success') },
    onError: () => addToast('Failed to send request', 'error'),
  })
  const cancelMutation = useMutation({
    mutationFn: () => cancelRequest(profileId),
    onSuccess: () => { setConnectStatus('NONE'); addToast('Request cancelled', 'success') },
    onError: () => addToast('Failed to cancel request', 'error'),
  })
  const messageMutation = useMutation({
    mutationFn: () => startConversation(profileId),
    onSuccess: () => navigate('/messages'),
    onError: () => navigate('/messages'),
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { addToast('Image must be under 2MB', 'error'); return }
    setAvatarUploading(true)
    try {
      const { avatarUrl } = await uploadAvatar(file)
      patchUser({ avatarUrl })
      invalidate()
      addToast('Profile photo updated', 'success')
    } catch (err) {
      addToast(getApiErrorMessage(err), 'error')
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
      invalidate()
      addToast('Resume uploaded', 'success')
    } catch (err) {
      addToast(getApiErrorMessage(err), 'error')
    } finally {
      setResumeUploading(false)
    }
  }

  if (isLoading) return <ProfileSkeleton />
  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-lg font-medium">Profile not found</p>
      </div>
    )
  }

  const skills = profile.skills ?? []
  const experiences = profile.experiences ?? []
  const educations = profile.educations ?? []
  const existingSkillIds = new Set(skills.map((s) => s.id))

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-16">
        <PageContainer size="md" className="space-y-4 pt-4">

          {/* ── Header Card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={rm ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800"
          >
            {/* Banner */}
            <div className={`relative h-48 bg-gradient-to-br ${bannerGradient} group`}>
              <div className="banner-dot-pattern pointer-events-none absolute inset-0 opacity-[0.06]" />
              {isOwnProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowGradientPicker((v) => !v)}
                    className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-black/25 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/40"
                  >
                    <Palette size={13} /> Change cover
                  </button>
                  <AnimatePresence>
                    {showGradientPicker && (
                      <motion.div
                        ref={gradientPickerRef}
                        key="gp"
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-4 top-12 z-20 flex gap-2.5 rounded-2xl bg-white/90 p-3 shadow-2xl backdrop-blur-md dark:bg-slate-900/90"
                      >
                        {GRADIENTS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleGradientPick(g)}
                            title={g}
                            className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} transition-transform hover:scale-110 ${bannerGradient === g ? 'ring-2 ring-white ring-offset-2' : ''}`}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Content area */}
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between">
                {/* Avatar */}
                <div className="relative -mt-14 flex-shrink-0">
                  <div className="rounded-full ring-[5px] ring-white shadow-xl dark:ring-slate-800">
                    <Avatar src={profile.avatarUrl ?? null} name={profile.name} size="xl" />
                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50 dark:border-slate-800"
                      title="Change photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-2.5">
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => navigate('/settings')}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/15 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                      <Pencil size={14} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      {connectStatus === 'ACCEPTED' ? (
                        <span className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                          <Check size={14} /> Connected
                        </span>
                      ) : connectStatus === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/15 dark:bg-white/8 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Click to cancel request"
                        >
                          <Check size={14} />
                          {cancelMutation.isPending ? 'Cancelling…' : 'Requested'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => connectMutation.mutate()}
                          disabled={connectMutation.isPending}
                          className={`${btnOutline} flex items-center gap-1.5`}
                        >
                          <UserPlus size={14} />
                          {connectMutation.isPending ? 'Sending…' : 'Connect'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => messageMutation.mutate()}
                        disabled={messageMutation.isPending}
                        className={`${btnPrimary} flex items-center gap-1.5`}
                      >
                        <MessageSquare size={14} />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Name + meta */}
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                  {profile.openToWork && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 size={11} /> Open to Work
                    </span>
                  )}
                </div>
                {profile.headline && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{profile.headline}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500">
                      <MapPin size={13} /> {profile.location}
                    </span>
                  )}
                  {isOwnProfile && (
                    <span className="text-sm text-slate-400 dark:text-slate-500">{profile.email}</span>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-5 flex items-center gap-8 border-t border-slate-100 pt-4 dark:border-white/8">
                <StatItem value={skills.length} label="Skills" />
                <div className="h-8 w-px bg-slate-100 dark:bg-white/10" />
                <StatItem value={experiences.length} label="Experience" />
                <div className="h-8 w-px bg-slate-100 dark:bg-white/10" />
                <StatItem value={educations.length} label="Education" />
              </div>
            </div>
          </motion.div>

          {/* ── Posts ─────────────────────────────────────────────────────── */}
          <SectionCard
            icon={<Newspaper size={15} />}
            title="Posts"
            delay={0.08}
          >
            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-2 rounded-xl border border-slate-100 p-4 dark:border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-1">
                        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-700/50" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-700/50" />
                    <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-700/50" />
                  </div>
                ))}
              </div>
            ) : userPosts.length === 0 ? (
              <div className="py-6 text-center">
                <Newspaper className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">
                  {isOwnProfile ? "You haven't posted anything yet." : 'No posts yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLikeToggle={handleLikeToggle}
                    onDelete={isOwnProfile ? handleDeletePost : undefined}
                    currentUserId={currentUser?.id ?? 0}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── About ─────────────────────────────────────────────────────── */}
          <SectionCard
            icon={<Pencil size={15} />}
            title="About"
            delay={0.14}
            action={
              isOwnProfile && !editingBio ? (
                <button
                  type="button"
                  aria-label="Edit bio"
                  onClick={() => { setBioText(profile.bio ?? ''); setEditingBio(true) }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10"
                >
                  <Pencil size={14} />
                </button>
              ) : undefined
            }
          >
            <AnimatePresence mode="wait">
              {editingBio ? (
                <motion.div key="bio-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-none`}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Tell people about yourself…"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateProfileMutation.mutate({ bio: bioText || undefined })} disabled={updateProfileMutation.isPending} className={`${btnPrimary} flex items-center gap-1.5`}>
                      <Check size={14} /> {updateProfileMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingBio(false)} className={btnOutline}>Cancel</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="bio-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {profile.bio ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{profile.bio}</p>
                  ) : isOwnProfile ? (
                    <p
                      className="cursor-pointer text-sm italic text-slate-400 hover:text-slate-500"
                      onClick={() => { setBioText(''); setEditingBio(true) }}
                    >
                      Add a bio to tell people about yourself…
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">No bio yet.</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <CalendarDays size={13} />
                    Joined {formatJoinDate(profile.experiences?.[0]?.createdAt ?? new Date().toISOString())}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* ── Resume ────────────────────────────────────────────────────── */}
          {(isOwnProfile || profile.resumeUrl) && (
            <SectionCard icon={<FileText size={15} />} title="Resume" delay={0.16}>
              {profile.resumeUrl ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{profile.resumeUrl.split('/').pop()}</span>
                    <Download className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                  </a>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={resumeUploading}
                      className={`${btnOutline} flex items-center gap-1.5`}
                    >
                      {resumeUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {resumeUploading ? 'Uploading…' : 'Replace'}
                    </button>
                  )}
                </div>
              ) : isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3.5 py-4 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                >
                  {resumeUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Upload your resume (PDF or Word, max 5MB)</>
                  )}
                </button>
              ) : null}
              {isOwnProfile && (
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                  aria-label="Upload resume"
                  title="Upload resume"
                />
              )}
            </SectionCard>
          )}

          {/* ── Experience ────────────────────────────────────────────────── */}
          {isOwnProfile && <ResumeAnalyzerCard />}

          <SectionCard
            icon={<Briefcase size={15} />}
            title="Experience"
            delay={0.2}
            action={
              isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => { setAddingExp(true); setEditingExpId(null) }}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <Plus size={14} /> Add
                </button>
              ) : undefined
            }
          >
            <div className="space-y-1">
              <AnimatePresence>
                {addingExp && (
                  <motion.div key="add-exp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                    <ExperienceForm onSave={(data) => addExpMutation.mutate(data)} onCancel={() => setAddingExp(false)} loading={addExpMutation.isPending} />
                  </motion.div>
                )}
              </AnimatePresence>

              {experiences.length === 0 && !addingExp && (
                <p className="py-2 text-sm text-slate-400">No experience added yet.</p>
              )}

              <div className="relative space-y-5">
                {experiences.length > 0 && (
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-primary/15 to-transparent" />
                )}
                {experiences.map((exp: ExperienceItem) => (
                  <div key={exp.id} className="relative pl-10">
                    <div className="absolute left-[11px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-white dark:bg-slate-800" />
                    {editingExpId === exp.id ? (
                      <ExperienceForm
                        initial={exp}
                        onSave={(data) => updateExpMutation.mutate({ id: exp.id, data })}
                        onCancel={() => setEditingExpId(null)}
                        loading={updateExpMutation.isPending}
                      />
                    ) : (
                      <div className="group flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-white">{exp.title}</p>
                          <p className="text-sm text-primary">{exp.companyName}{exp.location ? ` · ${exp.location}` : ''}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatDate(exp.startDate)}{exp.current ? ' — Present' : exp.endDate ? ` — ${formatDate(exp.endDate)}` : ''}
                          </p>
                          {exp.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{exp.description}</p>
                          )}
                        </div>
                        {isOwnProfile && (
                          confirmDeleteExpId === exp.id ? (
                            <div className="flex flex-shrink-0 items-center gap-1.5">
                              <button type="button" onClick={() => setConfirmDeleteExpId(null)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">Cancel</button>
                              <button type="button" onClick={() => { deleteExpMutation.mutate(exp.id); setConfirmDeleteExpId(null) }} disabled={deleteExpMutation.isPending} className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">Delete</button>
                            </div>
                          ) : (
                            <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button type="button" aria-label="Edit experience" onClick={() => { setEditingExpId(exp.id); setAddingExp(false) }} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10">
                                <Pencil size={13} />
                              </button>
                              <button type="button" aria-label="Delete experience" onClick={() => setConfirmDeleteExpId(exp.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* ── Education ─────────────────────────────────────────────────── */}
          <SectionCard
            icon={<GraduationCap size={15} />}
            title="Education"
            delay={0.26}
            action={
              isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => { setAddingEdu(true); setEditingEduId(null) }}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <Plus size={14} /> Add
                </button>
              ) : undefined
            }
          >
            <div className="space-y-1">
              <AnimatePresence>
                {addingEdu && (
                  <motion.div key="add-edu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                    <EducationForm onSave={(data) => addEduMutation.mutate(data)} onCancel={() => setAddingEdu(false)} loading={addEduMutation.isPending} />
                  </motion.div>
                )}
              </AnimatePresence>

              {educations.length === 0 && !addingEdu && (
                <p className="py-2 text-sm text-slate-400">No education added yet.</p>
              )}

              <div className="relative space-y-5">
                {educations.length > 0 && (
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-violet-400/40 via-violet-300/20 to-transparent" />
                )}
                {educations.map((edu: EducationItem) => (
                  <div key={edu.id} className="relative pl-10">
                    <div className="absolute left-[11px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-violet-500 bg-white dark:bg-slate-800" />
                    {editingEduId === edu.id ? (
                      <EducationForm
                        initial={edu}
                        onSave={(data) => updateEduMutation.mutate({ id: edu.id, data })}
                        onCancel={() => setEditingEduId(null)}
                        loading={updateEduMutation.isPending}
                      />
                    ) : (
                      <div className="group flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-white">{edu.school}</p>
                          {(edu.degree || edu.fieldOfStudy) && (
                            <p className="text-sm text-violet-600 dark:text-violet-400">
                              {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {(edu.startYear || edu.endYear) && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {edu.startYear ?? ''}{edu.endYear ? ` — ${edu.endYear}` : ''}
                            </p>
                          )}
                        </div>
                        {isOwnProfile && (
                          confirmDeleteEduId === edu.id ? (
                            <div className="flex flex-shrink-0 items-center gap-1.5">
                              <button type="button" onClick={() => setConfirmDeleteEduId(null)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">Cancel</button>
                              <button type="button" onClick={() => { deleteEduMutation.mutate(edu.id); setConfirmDeleteEduId(null) }} disabled={deleteEduMutation.isPending} className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">Delete</button>
                            </div>
                          ) : (
                            <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button type="button" aria-label="Edit education" onClick={() => { setEditingEduId(edu.id); setAddingEdu(false) }} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10">
                                <Pencil size={13} />
                              </button>
                              <button type="button" aria-label="Delete education" onClick={() => setConfirmDeleteEduId(edu.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* ── Skills ────────────────────────────────────────────────────── */}
          <SectionCard
            icon={<Tag size={15} />}
            title="Skills"
            delay={0.32}
            action={
              isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => setShowSkillPicker((v) => !v)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <Plus size={14} /> Add Skill
                </button>
              ) : undefined
            }
          >
            <AnimatePresence>
              {showSkillPicker && (
                <motion.div key="skill-picker" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4">
                  <SkillPicker
                    existingIds={existingSkillIds}
                    onAdd={(skillId) => { addSkillMutation.mutate(skillId); setShowSkillPicker(false) }}
                    onCreate={(name) => createSkillMutation.mutate(name)}
                    onClose={() => setShowSkillPicker(false)}
                    isCreating={createSkillMutation.isPending}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {skills.length === 0 ? (
              <p className="py-2 text-sm text-slate-400">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: SkillItem, i) => (
                  <motion.span
                    key={skill.id}
                    initial={rm ? false : { opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className="group flex items-center gap-1.5 rounded-full border border-primary/20 bg-gradient-to-r from-indigo-50 to-violet-50 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-primary/30 dark:from-indigo-900/20 dark:to-violet-900/20 dark:text-indigo-300"
                  >
                    {skill.name}
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => removeSkillMutation.mutate(skill.id)}
                        className="ml-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                        title="Remove"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </motion.span>
                ))}
              </div>
            )}
          </SectionCard>

        </PageContainer>

        <input ref={fileInputRef} type="file" aria-label="Upload profile photo" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
      </div>
    </PageTransition>
  )
}
