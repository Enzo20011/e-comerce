import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminRole } from '../../context/AdminAuthContext'
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser, type AdminUser } from '../../data/adminService'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'

const inputClass = 'rounded-md border border-ink/15 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error.'
}

export function AdminUsersPage() {
  useDocumentTitle('Admin — Usuarios')
  const { username: me } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AdminRole>('staff')
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null)

  const load = useCallback(() => {
    getAdminUsers().then(setUsers).catch((e) => toast.error(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    try {
      await createAdminUser({ username, password, role })
      toast.success(`Usuario "${username}" creado.`)
      setUsername('')
      setPassword('')
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  async function handleRole(user: AdminUser, next: AdminRole) {
    try {
      await updateAdminUser(user.username, { role: next })
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  async function handleResetPassword(user: AdminUser) {
    const next = window.prompt(`Nueva contraseña para ${user.username} (mín. 12, con mayúsculas, minúsculas y números):`)
    if (!next) return
    try {
      await updateAdminUser(user.username, { password: next })
      toast.success('Contraseña actualizada.')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await deleteAdminUser(pendingDelete.username)
      toast.success('Usuario eliminado.')
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    }
    setPendingDelete(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Usuarios</h1>
      <p className="mt-1 text-sm text-ink/50">
        Owner: acceso total. Staff: productos, pedidos y reseñas (sin cupones, monedas, usuarios, actividad ni borrados).
      </p>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-surface p-4">
        <input required minLength={3} placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} autoComplete="off" />
        <input required minLength={12} type="password" placeholder="Contraseña (mín. 12)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="new-password" />
        <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)} className={inputClass}>
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
        <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">Crear usuario</button>
      </form>

      <div className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/10 bg-surface">
        {(users ?? []).map((user) => (
          <div key={user.username} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium text-ink">
              {user.username}
              {user.username === me && <span className="ml-2 text-xs text-ink/40">(vos)</span>}
            </span>
            <div className="flex items-center gap-2">
              <select value={user.role} onChange={(e) => handleRole(user, e.target.value as AdminRole)} className={inputClass}>
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </select>
              <button type="button" onClick={() => handleResetPassword(user)} className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink/70 hover:bg-ink/5">
                Resetear contraseña
              </button>
              <button
                type="button"
                disabled={user.username === me}
                onClick={() => setPendingDelete(user)}
                aria-label={`Eliminar ${user.username}`}
                className="rounded-md p-2 text-ink/40 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar usuario"
          description={`¿Eliminar a "${pendingDelete.username}"? No podrá volver a ingresar.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
