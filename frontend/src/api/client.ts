import type { ApiError } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: { message: 'An unexpected error occurred' },
    }))
    throw new Error(body.error.message)
  }

  return res.json() as Promise<T>
}
