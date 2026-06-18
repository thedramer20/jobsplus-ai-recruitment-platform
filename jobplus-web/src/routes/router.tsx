import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute, AdminRoute, EmployerRoute } from './guards'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import AdminLayout from '@/features/admin/AdminLayout'

// ── Pages ─────────────────────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('@/pages/LandingPage'))
const LoginPage         = lazy(() => import('@/pages/LoginPage'))
const SignUpPage        = lazy(() => import('@/pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/ResetPasswordPage'))
const WelcomePage       = lazy(() => import('@/features/welcome/WelcomePage'))

const HomePage          = lazy(() => import('@/pages/HomePage'))
const FeedPage          = lazy(() => import('@/pages/FeedPage'))
const JobsPage          = lazy(() => import('@/pages/JobsPage'))
const JobDetailPage     = lazy(() => import('@/pages/JobDetailPage'))
const CompaniesPage     = lazy(() => import('@/pages/CompaniesPage'))
const CompanyDetailPage = lazy(() => import('@/pages/CompanyDetailPage'))
const NetworkPage       = lazy(() => import('@/pages/NetworkPage'))
const MessagingPage     = lazy(() => import('@/pages/MessagesPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const ProfilePage       = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage      = lazy(() => import('@/pages/SettingsPage'))
const InterviewCoachPage = lazy(() => import('@/pages/InterviewCoachPage'))
const SmartMatchAlgorithmPage = lazy(() => import('@/pages/SmartMatchAlgorithmPage'))
const AboutPage         = lazy(() => import('@/pages/AboutPage'))
const PrivacyPage       = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage         = lazy(() => import('@/pages/TermsPage'))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))

const EmployerDashboardPage  = lazy(() => import('@/pages/employer/DashboardPage'))
const PostJobPage            = lazy(() => import('@/pages/employer/PostJobPage'))
const MyJobsPage             = lazy(() => import('@/pages/employer/JobsPage'))
const ApplicantsPage         = lazy(() => import('@/pages/employer/ApplicantsPage'))
const CompanyProfilePage     = lazy(() => import('@/pages/employer/CompanyProfilePage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminUsersPage     = lazy(() => import('@/pages/admin/UsersPage'))
const AdminCompaniesPage = lazy(() => import('@/pages/admin/CompaniesPage'))
const AdminJobsPage      = lazy(() => import('@/pages/admin/JobsPage'))
const AdminPostsPage     = lazy(() => import('@/pages/admin/PostsPage'))
const AdminAuditLogPage  = lazy(() => import('@/pages/admin/AuditPage'))

// ── Suspense fallback ─────────────────────────────────────────────────────────
function Fallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-surface-dark">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function wrap(element: React.ReactNode) {
  return <Suspense fallback={<Fallback />}>{element}</Suspense>
}

// ── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Route 1 — Public (no Navbar)
  {
    element: <PublicLayout />,
    children: [
      { path: '/',       element: wrap(<LandingPage />) },
      { path: '/login',  element: wrap(<LoginPage />) },
      { path: '/signup', element: wrap(<SignUpPage />) },
      { path: '/forgot-password', element: wrap(<ForgotPasswordPage />) },
      { path: '/reset-password',  element: wrap(<ResetPasswordPage />) },
      { path: '/about',   element: wrap(<AboutPage />) },
      { path: '/privacy', element: wrap(<PrivacyPage />) },
      { path: '/terms',   element: wrap(<TermsPage />) },
    ],
  },

  // Route 1b — Welcome (full-screen, no layout)
  { path: '/welcome', element: wrap(<WelcomePage />) },

  // Route 2 — Authenticated (Navbar via AppLayout)
  {
    element: <PrivateRoute />,
    children: [{
      element: <AppLayout />,
      children: [
        { path: '/home',           element: wrap(<HomePage />) },
        { path: '/feed',           element: wrap(<FeedPage />) },
        { path: '/jobs',           element: wrap(<JobsPage />) },
        { path: '/jobs/:id',       element: wrap(<JobDetailPage />) },
        { path: '/companies',      element: wrap(<CompaniesPage />) },
        { path: '/companies/:id',  element: wrap(<CompanyDetailPage />) },
        { path: '/network',        element: wrap(<NetworkPage />) },
        { path: '/messages',       element: wrap(<MessagingPage />) },
        { path: '/notifications',  element: wrap(<NotificationsPage />) },
        { path: '/profile/:id',    element: wrap(<ProfilePage />) },
        { path: '/settings',       element: wrap(<SettingsPage />) },
        { path: '/ai/interview-coach', element: wrap(<InterviewCoachPage />) },
        { path: '/smartmatch-algorithm', element: wrap(<SmartMatchAlgorithmPage />) },
      ],
    }],
  },

  // Route 3 — Employer (Navbar via AppLayout)
  {
    element: <EmployerRoute />,
    children: [{
      element: <AppLayout />,
      children: [
        { path: '/employer/dashboard',            element: wrap(<EmployerDashboardPage />) },
        { path: '/employer/post-job',             element: wrap(<PostJobPage />) },
        { path: '/employer/jobs',                 element: wrap(<MyJobsPage />) },
        { path: '/employer/jobs/:id/applicants',  element: wrap(<ApplicantsPage />) },
        { path: '/employer/company',              element: wrap(<CompanyProfilePage />) },
      ],
    }],
  },

  // Route 4 — Admin (AdminLayout — own sidebar, no Navbar)
  {
    element: <AdminRoute />,
    children: [{
      element: <AdminLayout />,
      children: [
        { path: '/admin',            element: <Navigate to="/admin/dashboard" replace /> },
        { path: '/admin/dashboard',  element: wrap(<AdminDashboardPage />) },
        { path: '/admin/users',      element: wrap(<AdminUsersPage />) },
        { path: '/admin/companies',  element: wrap(<AdminCompaniesPage />) },
        { path: '/admin/jobs',       element: wrap(<AdminJobsPage />) },
        { path: '/admin/posts',      element: wrap(<AdminPostsPage />) },
        { path: '/admin/audit',      element: wrap(<AdminAuditLogPage />) },
      ],
    }],
  },

  // Route 5 — 404
  { path: '*', element: wrap(<NotFoundPage />) },
])
