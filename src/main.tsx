import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ThemeProvider, getPreferredTheme } from './context/ThemeContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { AppToaster } from './components/common/AppToaster'

document.documentElement.classList.toggle('dark', getPreferredTheme() === 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AdminAuthProvider>
        <CurrencyProvider>
          <RouterProvider router={router} />
          <AppToaster />
        </CurrencyProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
