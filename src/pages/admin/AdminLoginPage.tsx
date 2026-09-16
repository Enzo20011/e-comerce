import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export function AdminLoginPage() {
  useDocumentTitle('Admin — Iniciar sesión')

  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const success = await login(username, password)
    setSubmitting(false)
    if (!success) {
      setError('Usuario o contraseña incorrectos.')
      return
    }
    const from = (location.state as { from?: { pathname: string } } | null)?.from
    navigate(from?.pathname ?? '/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-surface/50 p-8">
        <p className="font-display text-xl font-semibold text-ink">
          Tienda<span className="italic text-accent">.</span>
          <span className="ml-1 text-xs font-normal text-ink/40">admin</span>
        </p>
        <p className="mt-1 text-sm text-ink/50">Ingresá para administrar la tienda.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-ink/70">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink/70">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
