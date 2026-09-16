import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { db } from '../db.ts'
import { signAdminToken } from '../auth.ts'
import { validateBody } from '../validation.ts'

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
})

export const adminRouter = Router()

adminRouter.post('/admin/login', loginLimiter, validateBody(loginSchema), (req, res) => {
  const { username, password } = req.body as z.infer<typeof loginSchema>

  const row = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as
    | { username: string; password_hash: string }
    | undefined

  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
    return
  }

  res.json({ token: signAdminToken(row.username) })
})
