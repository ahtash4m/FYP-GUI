import { useAuth } from "@/providers/auth-provider"
import type { UserRole } from "@/types/api"
import { Navigate, Outlet, useLocation } from "react-router-dom"

export function ProtectedRoute() {
  const { user, hydrated } = useAuth()
  const location = useLocation()

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
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
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}
