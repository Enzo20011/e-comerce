import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { clearAdminSession, requireAdmin, requireOwner, revokeSessions, setAdminSession } from '../auth.ts'
import { validateBody } from '../validation.ts'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000
// Hash falso para que el tiempo de respuesta sea el mismo exista o no el usuario.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12)

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
})

const passwordSchema = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres.')
  .max(200)
  .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), 'Usá mayúsculas, minúsculas y números.')

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
})

const newUserSchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números, . _ -'),
  password: passwordSchema,
  role: z.enum(['owner', 'staff']),
})

const userUpdateSchema = z
  .object({ role: z.enum(['owner', 'staff']).optional(), password: passwordSchema.optional() })
  .refine((d) => d.role !== undefined || d.password !== undefined, 'Nada para actualizar.')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
})

interface AdminRow {
  username: string
  password_hash: string
  role: 'owner' | 'staff'
  failed_attempts: number
  locked_until: number
}

export const adminRouter = Router()

adminRouter.post('/admin/login', loginLimiter, validateBody(loginSchema), async (req, res) => {
  const { username, password } = req.body as z.infer<typeof loginSchema>

  const row = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as unknown as
    | AdminRow
    | undefined

  if (row && row.locked_until > Date.now()) {
    await bcrypt.compare(password, DUMMY_HASH)
    res.status(429).json({ error: 'Demasiados intentos. Probá de nuevo en unos minutos.' })
    return
  }

  const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH)

  if (!row || !ok) {
    if (row) {
      const attempts = row.failed_attempts + 1
      const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_MS : 0
      db.prepare('UPDATE admin_users SET failed_attempts = ?, locked_until = ? WHERE username = ?').run(
        lockedUntil ? 0 : attempts,
        lockedUntil,
        row.username,
      )
      if (lockedUntil) logActivity(`Cuenta bloqueada 15 min por intentos fallidos (IP ${req.ip})`, row.username)
    }
    res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
    return
  }

  db.prepare('UPDATE admin_users SET failed_attempts = 0, locked_until = 0 WHERE username = ?').run(row.username)
  logActivity(`Inicio de sesión (IP ${req.ip})`, row.username)
  setAdminSession(res, row.username)
  res.json({ username: row.username, role: row.role })
})

adminRouter.post('/admin/change-password', requireAdmin, validateBody(changePasswordSchema), async (req, res) => {
  const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>
  const username = String(res.locals.admin)

  const row = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as unknown as
    | AdminRow
    | undefined

  if (!row || !(await bcrypt.compare(currentPassword, row.password_hash))) {
    res.status(401).json({ error: 'La contraseña actual es incorrecta.' })
    return
  }

  db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(
    await bcrypt.hash(newPassword, 12),
    username,
  )
  revokeSessions(username)
  setAdminSession(res, username)
  logActivity('Cambió su contraseña', username)
  res.status(204).end()
})

adminRouter.get('/admin/me', requireAdmin, (_req, res) => {
  res.json({ username: res.locals.admin, role: res.locals.role })
})

adminRouter.post('/admin/logout', requireAdmin, (_req, res) => {
  revokeSessions(String(res.locals.admin))
  clearAdminSession(res)
  res.status(204).end()
})

// --- Gestión de usuarios (solo owner) ---

function ownerCount(): number {
  return (db.prepare("SELECT COUNT(*) AS c FROM admin_users WHERE role = 'owner'").get() as unknown as { c: number }).c
}

adminRouter.get('/admin/users', requireAdmin, requireOwner, (_req, res) => {
  const rows = db.prepare('SELECT username, role FROM admin_users ORDER BY rowid').all()
  res.json(rows)
})

adminRouter.post('/admin/users', requireAdmin, requireOwner, validateBody(newUserSchema), async (req, res) => {
  const { username, password, role } = req.body as z.infer<typeof newUserSchema>
  if (db.prepare('SELECT 1 FROM admin_users WHERE username = ?').get(username)) {
    res.status(409).json({ error: 'Ya existe un usuario con ese nombre.' })
    return
  }
  db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
    username,
    await bcrypt.hash(password, 12),
    role,
  )
  logActivity(`Creó el usuario "${username}" (${role})`, res.locals.admin)
  res.status(201).json({ username, role })
})

adminRouter.patch('/admin/users/:username', requireAdmin, requireOwner, validateBody(userUpdateSchema), async (req, res) => {
  const username = String(req.params.username)
  const { role, password } = req.body as z.infer<typeof userUpdateSchema>
  const target = db.prepare('SELECT role FROM admin_users WHERE username = ?').get(username) as unknown as
    | { role: string }
    | undefined
  if (!target) {
    res.status(404).json({ error: 'Usuario no encontrado.' })
    return
  }
  if (role && role !== 'owner' && target.role === 'owner' && ownerCount() <= 1) {
    res.status(409).json({ error: 'Tiene que quedar al menos un owner.' })
    return
  }
  if (role) db.prepare('UPDATE admin_users SET role = ? WHERE username = ?').run(role, username)
  if (password) {
    db.prepare('UPDATE admin_users SET password_hash = ?, failed_attempts = 0, locked_until = 0 WHERE username = ?').run(
      await bcrypt.hash(password, 12),
      username,
    )
  }
  revokeSessions(username)
  logActivity(`Actualizó el usuario "${username}"${role ? ` (rol ${role})` : ''}${password ? ' (nueva contraseña)' : ''}`, res.locals.admin)
  res.status(204).end()
})

adminRouter.delete('/admin/users/:username', requireAdmin, requireOwner, (req, res) => {
  const username = String(req.params.username)
  const target = db.prepare('SELECT role FROM admin_users WHERE username = ?').get(username) as unknown as
    | { role: string }
    | undefined
  if (!target) {
    res.status(404).json({ error: 'Usuario no encontrado.' })
    return
  }
  if (username === res.locals.admin) {
    res.status(409).json({ error: 'No podés eliminar tu propio usuario.' })
    return
  }
  if (target.role === 'owner' && ownerCount() <= 1) {
    res.status(409).json({ error: 'Tiene que quedar al menos un owner.' })
    return
  }
  db.prepare('DELETE FROM admin_users WHERE username = ?').run(username)
  logActivity(`Eliminó el usuario "${username}"`, res.locals.admin)
  res.status(204).end()
})
