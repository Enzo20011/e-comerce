import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from '../lib/api'

export type AdminRole = 'owner' | 'staff'

interface AdminSession {
  username: string
  role: AdminRole
}

interface AdminAuthContextValue {
  /** true mientras se consulta si ya hay una sesión abierta (cookie). */
  loading: boolean
  isAuthenticated: boolean
  username: string | null
  role: AdminRole | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiFetch<AdminSession>('/admin/me', { auth: false })
      .then((data) => active && setSession(data))
      .catch(() => active && setSession(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const data = await apiFetch<AdminSession>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setSession(data)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/admin/logout', { method: 'POST', auth: true })
    } catch {
      // la cookie puede haber expirado ya
    }
    setSession(null)
  }, [])

  const value: AdminAuthContextValue = {
    loading,
    isAuthenticated: session !== null,
    username: session?.username ?? null,
    role: session?.role ?? null,
    login,
    logout,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
