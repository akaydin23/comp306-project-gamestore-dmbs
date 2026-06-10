import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import * as authApi from '../api/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('token'))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    authApi
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email.trim(), password)
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authApi.register(username.trim(), email.trim(), password)
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
