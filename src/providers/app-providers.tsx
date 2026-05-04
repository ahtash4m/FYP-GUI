import { Toaster } from "sonner"
import type { ReactNode } from "react"
import { AuthProvider } from "./auth-provider"
import { QueryProvider } from "./query-provider"

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </QueryProvider>
  )
}
