import { CuraLogo } from "@/components/layout/cura-logo"
import { useAuth } from "@/providers/auth-provider"
import type { UserRole } from "@/types/api"
import { Navigate, Outlet, useLocation } from "react-router-dom"

function BrandedLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <CuraLogo size="lg" />
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <span>Authenticating secure session…</span>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { user, hydrated } = useAuth()
  const location = useLocation()

  if (!hydrated) {
    return <BrandedLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function AdminRoute({ roles }: { roles: UserRole[] }) {
  const { user, hydrated } = useAuth()
  const location = useLocation()

  if (!hydrated) {
    return <BrandedLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}
