import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { changePassword } from '../../data/adminService'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const inputClass =
  'w-full rounded-md border border-ink/15 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent'

export function AdminAccountPage() {
  useDocumentTitle('Admin — Mi cuenta')
  const { username, role } = useAdminAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (next !== confirm) {
      toast.error('Las contraseñas nuevas no coinciden.')
      return
    }
    setSubmitting(true)
    try {
      await changePassword(current, next)
      toast.success('Contraseña actualizada. Se cerraron tus otras sesiones.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos cambiar la contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Mi cuenta</h1>
      <p className="mt-1 text-sm text-ink/50">
        Usuario <span className="font-medium text-ink">{username}</span> · rol {role === 'owner' ? 'owner' : 'staff'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4 rounded-xl border border-ink/10 bg-surface p-6">
        <h2 className="font-semibold text-ink">Cambiar contraseña</h2>
        <input type="password" required autoComplete="current-password" placeholder="Contraseña actual" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        <input type="password" required minLength={12} autoComplete="new-password" placeholder="Contraseña nueva" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
        <input type="password" required minLength={12} autoComplete="new-password" placeholder="Repetí la contraseña nueva" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        <p className="text-xs text-ink/50">Mínimo 12 caracteres, con mayúsculas, minúsculas y números.</p>
        <button type="submit" disabled={submitting} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50">
          {submitting ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
