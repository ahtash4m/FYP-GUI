import { AdminShell } from "@/components/layout/admin-shell"
import { PatientShell } from "@/components/layout/patient-shell"
import { AdminOverviewPage } from "@/pages/admin-overview-page"
import { AdminSettingsPage } from "@/pages/admin-settings-page"
import { AdminTreatmentsPage } from "@/pages/admin-treatments-page"
import { AdminUsersPage } from "@/pages/admin-users-page"
import { LoginPage } from "@/pages/login-page"
import { PatientDashboardPage } from "@/pages/patient-dashboard-page"
import { PatientHelpPage } from "@/pages/patient-help-page"
import { PatientProcessingPage } from "@/pages/patient-processing-page"
import { PatientProfilePage } from "@/pages/patient-profile-page"
import { PatientResultsPage } from "@/pages/patient-results-page"
import { PatientScansPage } from "@/pages/patient-scans-page"
import { AdminRoute, ProtectedRoute } from "@/pages/protected-route"
import { RegisterPage } from "@/pages/register-page"
import { useAuth } from "@/providers/auth-provider"
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

function RootRedirect() {
  const { user, hydrated } = useAuth()
  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role === "admin") return <Navigate to="/admin/overview" replace />
  return <Navigate to="/app/dashboard" replace />
}

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <PatientShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <PatientDashboardPage /> },
          { path: "processing", element: <PatientProcessingPage /> },
          { path: "results/:scanId", element: <PatientResultsPage /> },
          { path: "scans", element: <PatientScansPage /> },
          { path: "profile", element: <PatientProfilePage /> },
          { path: "help", element: <PatientHelpPage /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute roles={["admin"]} />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: "overview", element: <AdminOverviewPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "treatments", element: <AdminTreatmentsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
