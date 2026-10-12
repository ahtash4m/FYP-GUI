import { Toaster } from "sonner"
import type { ReactNode } from "react"
import { AuthProvider } from "./auth-provider"
import { QueryProvider } from "./query-provider"
import { ThemeProvider, useTheme } from "./theme-provider"

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme}
      richColors
      closeButton
      position="top-right"
    />
  )
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cura-ui-theme">
      <QueryProvider>
        <AuthProvider>
          {children}
          <ThemedToaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
