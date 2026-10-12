import { Brand } from "@/components/layout/brand"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import {
  CircleHelp,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  User,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/app/dashboard", label: "Triage Studio", icon: LayoutDashboard },
  { to: "/app/scans", label: "Scan Journal", icon: History },
  { to: "/app/help", label: "Clinical Guide", icon: CircleHelp },
  { to: "/app/profile", label: "My Profile", icon: User },
]

export function PatientShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isScanning = location.pathname.includes("/app/dashboard")

  return (
    <div className="min-h-svh flex flex-col cura-mesh-bg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ========================================================= */}
      {/* TOP FLOATING FROSTED GLASS HEADER                        */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 cura-glass-nav transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <Link to="/app/dashboard" className="flex items-center group">
              <Brand size="md" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200/80 dark:border-slate-800">
              {navItems.map(({ to, label, icon: Icon }) => (
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
            {/* Live Model Telemetry Pill (Desktop) */}
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50/50 dark:border-teal-900/60 dark:bg-teal-950/40 px-3 py-1 text-[11px] font-medium text-teal-800 dark:text-teal-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Clinical AI • 8 Skin Conditions</span>
            </div>

            {/* Quick "New Scan" Action Button */}
            {!isScanning && (
              <Button
                size="sm"
                className="hidden sm:inline-flex h-9 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-sm shadow-teal-700/20 gap-1.5"
                onClick={() => navigate("/app/dashboard")}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Scan</span>
              </Button>
            )}

            {/* Smooth Theme Toggle Button */}
            <ThemeToggle />

            {/* User Pill & Quick Logout */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-slate-800">
              <Link
                to="/app/profile"
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                title="View Profile"
              >
                <Avatar className="h-8 w-8 border border-teal-200 dark:border-teal-800 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-xs font-bold">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "PT"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {user?.displayName || "Patient"}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    Verified Patient
                  </span>
                </div>
              </Link>

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
            {navItems.map(({ to, label, icon: Icon }) => (
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
              <span className="text-xs text-slate-500 truncate">{user?.email}</span>
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
      {/* MAIN VIEWPORT CANVAS                                     */}
      {/* ========================================================= */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* ========================================================= */}
      {/* BOTTOM BRAND FOOTER                                       */}
      {/* ========================================================= */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Cura Clinical Triage</span>
            <span>•</span>
            <span>AI-Guided Dermatological Care</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Private & Encrypted</span>
            <span>•</span>
            <span>8 Recognized Skin Conditions</span>
            <span>•</span>
            <span>Evidence-Based Guidance</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
