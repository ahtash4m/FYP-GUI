import * as authApi from "@/features/auth/auth.api"
import type { AuthUser, UserRole } from "@/types/api"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "acne_classification_auth_user_v1"

type AuthContextValue = {
  user: AuthUser | null
  hydrated: boolean
  login: (
    email: string,
    password: string,
    devRoleHint?: UserRole
  ) => Promise<AuthUser>
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw) as AuthUser)
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user, hydrated])

  const login = useCallback(
    async (email: string, password: string, devRoleHint?: UserRole) => {
      const u = await authApi.login(email, password, devRoleHint)
      setUser(u)
      return u
    },
    []
  )

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const u = await authApi.register(email, password, displayName)
      setUser(u)
      return u
    },
    []
  )

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, hydrated, login, register, logout }),
    [user, hydrated, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
