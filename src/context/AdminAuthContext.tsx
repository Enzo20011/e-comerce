import { createContext, useEffect, useReducer, type ReactNode } from 'react'

const STORAGE_KEY = 'ecomerce.admin.session'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

interface AdminAuthState {
  isAuthenticated: boolean
}

type AdminAuthAction = { type: 'LOGIN' } | { type: 'LOGOUT' }

function loadInitialState(): AdminAuthState {
  try {
    return { isAuthenticated: sessionStorage.getItem(STORAGE_KEY) === 'true' }
  } catch {
    return { isAuthenticated: false }
  }
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
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      if (state.isAuthenticated) sessionStorage.setItem(STORAGE_KEY, 'true')
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // almacenamiento no disponible
    }
  }, [state.isAuthenticated])

  const value: AdminAuthContextValue = {
    isAuthenticated: state.isAuthenticated,
    login: (username, password) => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        dispatch({ type: 'LOGIN' })
        return true
      }
      return false
    },
    logout: () => dispatch({ type: 'LOGOUT' }),
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
