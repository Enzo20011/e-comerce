import { Toaster } from 'sonner'
import { useTheme } from '../../hooks/useTheme'

export function AppToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme}
      richColors
      position="bottom-right"
      toastOptions={{ style: { fontFamily: 'Inter, system-ui, sans-serif' } }}
    />
  )
}
