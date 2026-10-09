import { postJson } from "@/lib/api/client"
import { useMockApi } from "@/lib/api/config"
import type { AuthUser, UserRole } from "@/types/api"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * POST /api/auth/login
 */
export async function login(
  email: string,
  password: string,
  /** Dev-only: pick role when using mocks; remove when backend infers role. */
  devRoleHint?: UserRole
): Promise<AuthUser> {
  if (useMockApi()) {
    await delay(450)
    const role: UserRole =
      devRoleHint ?? (email.toLowerCase().includes("admin") ? "admin" : "patient")
    return {
      id: role === "admin" ? "admin-1" : "patient-1",
      email,
      displayName: role === "admin" ? "Admin User" : "John Doe",
      role,
    }
  }
  
  const data = await postJson<{ user: AuthUser; token: string }>("/api/auth/login", { 
    email, 
    password 
  })
  
  localStorage.setItem("acne_jwt_token", data.token)
  return data.user
}

/** POST /api/auth/register */
export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  if (useMockApi()) {
    await delay(500)
    return {
      id: `patient-${Date.now()}`,
      email,
      displayName: displayName || "New User",
      role: "patient",
    }
  }
  
  const data = await postJson<{ user: AuthUser; token: string }>("/api/auth/register", {
    email,
    password,
    display_name: displayName,
  })
  
  localStorage.setItem("acne_jwt_token", data.token)
  return data.user
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  if (useMockApi()) {
    await delay(150)
    return
  }
  
  try {
    await postJson("/api/auth/logout", {})
  } catch (error) {
    // Ignore backend errors on logout, just ensure local token is cleared
  } finally {
    localStorage.removeItem("acne_jwt_token")
  }
}