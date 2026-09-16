import { createContext, useReducer, type ReactNode } from 'react'
import { apiFetch, getAdminToken, setAdminToken } from '../lib/api'

interface AdminAuthState {
  isAuthenticated: boolean
}

type AdminAuthAction = { type: 'LOGIN' } | { type: 'LOGOUT' }

function loadInitialState(): AdminAuthState {
  return { isAuthenticated: getAdminToken() !== null }
}

function authReducer(state: AdminAuthState, action: AdminAuthAction): AdminAuthState {
  switch (action.type) {
    case 'LOGIN':
      return { isAuthenticated: true }
    case 'LOGOUT':
      return { isAuthenticated: false }
    default:
      return state
  }
}

interface AdminAuthContextValue {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadInitialState)

  const value: AdminAuthContextValue = {
    isAuthenticated: state.isAuthenticated,
    login: async (username, password) => {
      try {
        const { token } = await apiFetch<{ token: string }>('/admin/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
        setAdminToken(token)
        dispatch({ type: 'LOGIN' })
        return true
      } catch {
        return false
      }
    },
    logout: () => {
      setAdminToken(null)
      dispatch({ type: 'LOGOUT' })
    },
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
