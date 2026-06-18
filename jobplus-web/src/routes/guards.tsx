import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'

function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (user?.role !== Role.ADMIN) return <Navigate to="/feed" replace />
  return <Outlet />
}

export function EmployerRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (user?.role !== Role.EMPLOYER) return <Navigate to="/feed" replace />
  return <Outlet />
}
