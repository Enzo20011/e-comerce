import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { requireAdmin, signAdminToken } from '../auth.ts'
import { validateBody } from '../validation.ts'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000
// Hash falso para que el tiempo de respuesta sea el mismo exista o no el usuario.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12)

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres.')
    .max(200)
    .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), 'Usá mayúsculas, minúsculas y números.'),
})

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
  res.json({ token: signAdminToken(row.username) })
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
  logActivity('Cambió su contraseña', username)
  res.status(204).end()
})
