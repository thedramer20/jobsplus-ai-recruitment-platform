import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Home, Briefcase, Building2, Users, Newspaper,
  LayoutDashboard, PlusCircle, ClipboardList,
  MessageSquare, Bell, Settings, LogOut, User, Brain,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getUnreadCount } from '@/api/notifications'
import { getConversations } from '@/api/messages'
import { NotificationsDrawer } from '@/features/notifications'
import { Role } from '@/types'
import logoFull from '@/assets/logo/logo-full.svg'
import logoIcon from '@/assets/logo/logo-icon.svg'
import { Avatar } from '@/components/ui/Avatar'

interface NavLinkItem {
  to: string
  label: string
  Icon: LucideIcon
}

const SEEKER_LINKS: NavLinkItem[] = [
  { to: '/home',      label: 'Home',      Icon: Home      },
  { to: '/jobs',      label: 'Jobs',      Icon: Briefcase },
  { to: '/companies', label: 'Companies', Icon: Building2 },
  { to: '/network',   label: 'Network',   Icon: Users     },
  { to: '/smartmatch-algorithm', label: 'SmartMatch', Icon: Brain },
  { to: '/feed',      label: 'Feed',      Icon: Newspaper },
]

const EMPLOYER_LINKS: NavLinkItem[] = [
  { to: '/employer/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/employer/post-job',  label: 'Post Job',  Icon: PlusCircle      },
  { to: '/employer/jobs',      label: 'My Jobs',   Icon: ClipboardList   },
  { to: '/smartmatch-algorithm', label: 'SmartMatch', Icon: Brain        },
  { to: '/employer/company',   label: 'Company',   Icon: Building2       },
]

export function Navbar() {
  const navigate  = useNavigate()
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const toggleNotifications = useUIStore((s) => s.toggleNotifications)
  const [dropdownOpen, setDropdownOpen]   = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const isEmployer = user?.role === Role.EMPLOYER
  const navLinks   = isEmployer ? EMPLOYER_LINKS : SEEKER_LINKS

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn:  getUnreadCount,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  })

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn:  getConversations,
    refetchInterval: 30000,
    enabled: isAuthenticated,
    retry: false,
  })
  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    clearAuth()
    setDropdownOpen(false)
    navigate('/login')
  }

  return (
    <>
      <motion.header
        initial={prefersReducedMotion ? false : { y: -100 }}
        animate={prefersReducedMotion ? {} : { y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/80"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 transition-opacity hover:opacity-80">
            <img src={logoFull} alt="JobPlus" className="hidden h-8 md:block" />
            <img src={logoIcon} alt="JobPlus" className="h-8 md:hidden" />
          </Link>

          {/* Center nav links (desktop) */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-500 dark:text-indigo-400' : ''}`} />
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <motion.button
                  onClick={toggleNotifications}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.93 }}
                  className="relative rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        key="notif-badge"
                        initial={prefersReducedMotion ? false : { scale: 0 }}
                        animate={prefersReducedMotion ? {} : { scale: 1 }}
                        exit={prefersReducedMotion ? {} : { scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[10px] font-bold text-white shadow-sm"
                      >
                        {unreadCount >= 10 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Messages */}
                <Link
                  to="/messages"
                  aria-label="Messages"
                  className="relative rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <MessageSquare className="h-5 w-5" />
                  <AnimatePresence>
                    {totalUnreadMessages > 0 && (
                      <motion.span
                        key="msg-badge"
                        initial={prefersReducedMotion ? false : { scale: 0 }}
                        animate={prefersReducedMotion ? {} : { scale: 1 }}
                        exit={prefersReducedMotion ? {} : { scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-1 text-[10px] font-bold text-white shadow-sm"
                      >
                        {totalUnreadMessages >= 10 ? '9+' : totalUnreadMessages}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                {/* Settings */}
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                </Link>

                {/* Avatar + dropdown */}
                <div className="relative ml-1" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    aria-label="Account menu"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-indigo-400/60 dark:hover:ring-indigo-500/60"
                  >
                    <Avatar src={user?.avatarUrl ?? null} name={user?.name ?? ''} size="md" />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: -6 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.94, y: -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 dark:border-white/[0.08] dark:bg-slate-800 dark:shadow-black/30"
                      >
                        {/* User info header */}
                        <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-violet-50 px-4 py-3.5 dark:border-white/[0.06] dark:from-indigo-500/10 dark:to-violet-500/10">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>

                        <div className="p-1.5">
                          {isEmployer ? (
                            <Link
                              to="/employer/company"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                            >
                              <Building2 className="h-4 w-4 text-slate-400" />
                              Company Profile
                            </Link>
                          ) : (
                            <Link
                              to={`/profile/${user?.id}`}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                            >
                              <User className="h-4 w-4 text-slate-400" />
                              {t('nav.profile')}
                            </Link>
                          )}
                          <Link
                            to="/ai/interview-coach"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                          >
                            <Brain className="h-4 w-4 text-slate-400" />
                            Interview Coach
                          </Link>
                          <Link
                            to="/smartmatch-algorithm"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                          >
                            <Brain className="h-4 w-4 text-slate-400" />
                            SmartMatch Algorithm
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                          >
                            <Settings className="h-4 w-4 text-slate-400" />
                            {t('nav.settings')}
                          </Link>
                        </div>

                        <div className="border-t border-slate-100 p-1.5 dark:border-white/[0.06]">
                          <motion.button
                            onClick={handleLogout}
                            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <LogOut className="h-4 w-4" />
                            {t('nav.logout')}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 hover:shadow-md"
                >
                  {t('nav.signUp')}
                </Link>
              </>
            )}

            {/* Hamburger (mobile) */}
            <motion.button
              onClick={() => setMobileMenuOpen((o) => !o)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.93 }}
              aria-label="Toggle menu"
              className="ml-1 rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06] md:hidden"
            >
              <motion.div
                animate={mobileMenuOpen ? 'open' : 'closed'}
                className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]"
              >
                <motion.span
                  variants={{ open: { rotate: 45, y: 7 }, closed: { rotate: 0, y: 0 } }}
                  transition={{ duration: 0.2 }}
                  className="block h-0.5 w-5 rounded-full bg-current"
                />
                <motion.span
                  variants={{ open: { opacity: 0, x: -8 }, closed: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.2 }}
                  className="block h-0.5 w-5 rounded-full bg-current"
                />
                <motion.span
                  variants={{ open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } }}
                  transition={{ duration: 0.2 }}
                  className="block h-0.5 w-5 rounded-full bg-current"
                />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile slide-down nav menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
              exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/95 md:hidden"
            >
              <nav className="flex flex-col gap-1 px-4 py-3">
                {navLinks.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </NavLink>
                ))}

                {isAuthenticated && !isEmployer && (
                  <>
                    <Link
                      to={`/profile/${user?.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/smartmatch-algorithm"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      <Brain className="h-4 w-4 flex-shrink-0" />
                      SmartMatch Algorithm
                    </Link>
                    <Link
                      to="/ai/interview-coach"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      <Brain className="h-4 w-4 flex-shrink-0" />
                      Interview Coach
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <NotificationsDrawer />
    </>
  )
}
