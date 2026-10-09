import { apiUrl } from "./config"

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

/**
 * Helper to retrieve the JWT token and format the Authorization header.
 */
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("acne_jwt_token")
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

/**
 * Low-level JSON GET.
 */
export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    headers: { 
      Accept: "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed`, res.status, body)
  }
  return body as T
}

export async function postJson<T>(path: string, data: Json): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(`POST ${path} failed`, res.status, body)
  }
  return body as T
}

export async function patchJson<T>(path: string, data: Json): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(`PATCH ${path} failed`, res.status, body)
  }
  return body as T
}

export async function deleteJson<T>(path: string): Promise<T | void> {
  const res = await fetch(apiUrl(path), {
    method: "DELETE",
    headers: { 
      Accept: "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(`DELETE ${path} failed`, res.status, body)
  }
  return body as T
}

/**
 * Multipart upload (e.g. scan image). Backend: POST /api/scans with file field "image".
 */
export async function postFormData<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      ...getAuthHeader()
    },
    body: form,
    credentials: "include",
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(`POST ${path} (multipart) failed`, res.status, body)
  }
  return body as T
}