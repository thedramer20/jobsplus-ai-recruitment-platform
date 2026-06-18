import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DotPattern } from '@/components/magic/DotPattern'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  ClipboardList,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ArrowLeftToLine,
} from 'lucide-react'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
  { to: '/admin/companies', icon: Building2,        label: 'Companies' },
  { to: '/admin/jobs',      icon: Briefcase,        label: 'Jobs' },
  { to: '/admin/posts',     icon: FileText,         label: 'Posts' },
  { to: '/admin/audit',     icon: ClipboardList,    label: 'Audit Log' },
]

function SidebarFooter({ onClose }: { onClose?: () => void }) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    if (onClose) onClose()
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="border-t border-slate-200/60 p-3 dark:border-white/10">
      <Link
        to="/home"
        onClick={onClose}
        className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-300"
      >
        <ArrowLeftToLine size={14} className="flex-shrink-0" />
        Back to App
      </Link>
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <Avatar src={user?.avatarUrl ?? null} name={user?.name ?? 'Admin'} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
            {user?.name ?? 'Admin'}
          </p>
          <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
            {user?.email ?? ''}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  )
}

function SidebarNav({ onClose }: { onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
            }`
          }
        >
          <Icon size={18} className="flex-shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-slate-200/60 bg-white dark:border-white/10 dark:bg-surface-dark">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">JobPlus</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        {/* Footer */}
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/60 bg-white px-4 dark:border-white/10 dark:bg-surface-dark">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <ShieldCheck size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Admin Panel</span>
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-slate-200/60 bg-white dark:border-white/10 dark:bg-surface-dark"
            >
              <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">JobPlus</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin Panel</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav onClose={() => setMobileOpen(false)} />
              </div>
              <SidebarFooter onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto md:pt-0 pt-14">
        <DotPattern dotColor="#cbd5e1" spacing={24} dotSize={1.5} />
        <Outlet />
      </main>
    </div>
  )
}
