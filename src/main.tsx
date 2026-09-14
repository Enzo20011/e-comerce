import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ThemeProvider, getPreferredTheme } from './context/ThemeContext'
import { seedHistoricalOrdersIfEmpty } from './data/orderStore'

document.documentElement.classList.toggle('dark', getPreferredTheme() === 'dark')
seedHistoricalOrdersIfEmpty()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AdminAuthProvider>
        <RouterProvider router={router} />
      </AdminAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
