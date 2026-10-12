import { Brand } from "@/components/layout/brand"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import {
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const adminNav = [
  { to: "/admin/overview", label: "Overview & Telemetry", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Management", icon: Users },
  { to: "/admin/treatments", label: "Treatment Database", icon: Database },
  { to: "/admin/settings", label: "System Settings", icon: Settings },
]

export function AdminShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-svh flex flex-col cura-mesh-bg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ========================================================= */}
      {/* ADMIN COMMAND CONSOLE HEADER                             */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 cura-glass-nav transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand + Console badge */}
          <div className="flex items-center gap-6">
            <Link to="/admin/overview" className="flex items-center gap-2 group">
              <Brand size="md" />
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none"
              >
                ADMIN CONSOLE
              </Badge>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200/80 dark:border-slate-800">
              {adminNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                      isActive
                        ? "bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60"
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Database Sync Status */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MS SQL Server Online</span>
            </div>

            {/* Patient Portal Switcher */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-9 rounded-xl text-xs font-medium border-slate-200 dark:border-slate-800"
              onClick={() => navigate("/app/dashboard")}
            >
              Patient View
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Admin Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 p-1">
                <Avatar className="h-8 w-8 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white text-xs font-bold">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {user?.displayName || "Admin"}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Superuser
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                onClick={async () => {
                  await logout()
                  navigate("/login", { replace: true })
                }}
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-2">
            {adminNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate("/app/dashboard")}
              >
                Go to Patient Portal
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-rose-600 gap-1.5"
                onClick={async () => {
                  await logout()
                  navigate("/login", { replace: true })
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* MAIN ADMIN VIEWPORT CANVAS                                */}
      {/* ========================================================= */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
