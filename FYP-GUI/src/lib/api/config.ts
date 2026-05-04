/**
 * Central flags for swapping mock data vs real Flask (or other) API later.
 * Set VITE_USE_MOCK_API=false in .env when backend routes exist under /api.
 */
export function useMockApi(): boolean {
  const v = import.meta.env.VITE_USE_MOCK_API
  return v !== "false" && v !== "0"
}

/** Absolute or same-origin base. Empty = relative /api (works with Vite proxy). */
export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
}

export function apiUrl(path: string): string {
  const base = apiBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
