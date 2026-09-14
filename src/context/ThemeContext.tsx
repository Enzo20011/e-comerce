import { createContext, useEffect, useReducer, type ReactNode } from 'react'

const STORAGE_KEY = 'ecomerce.theme'

export type Theme = 'light' | 'dark'

export function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage no disponible
  }

  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch {
    // matchMedia no disponible
  }

  return 'light'
}

function themeReducer(_state: Theme, action: Theme): Theme {
  return action
}

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, dispatch] = useReducer(themeReducer, undefined, getPreferredTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage no disponible
    }
  }, [theme])

  const value: ThemeContextValue = {
    theme,
    toggleTheme: () => dispatch(theme === 'dark' ? 'light' : 'dark'),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
