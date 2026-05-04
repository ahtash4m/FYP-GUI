import { Brand } from "@/components/layout/brand"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/providers/auth-provider"
import {
  Database,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const nav = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Management", icon: Users },
  { to: "/admin/treatments", label: "Treatment Database", icon: Database },
  { to: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh bg-muted/40">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card sm:w-64">
        <div className="flex h-16 items-center border-b px-4">
          <Brand />
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={async () => {
              await logout()
              navigate("/login", { replace: true })
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
          <div />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.displayName?.slice(0, 1) ?? "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.displayName}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
