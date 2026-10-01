import { Router } from 'express'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { requireAdmin, requireOwner } from '../auth.ts'
import { validateBody } from '../validation.ts'
import { newsletterLimiter } from '../limiters.ts'

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
})

export const newsletterRouter = Router()

newsletterRouter.post('/newsletter', newsletterLimiter, validateBody(subscribeSchema), (req, res) => {
  const { email } = req.body as z.infer<typeof subscribeSchema>

  db.prepare('INSERT OR IGNORE INTO subscribers (email, subscribed_at) VALUES (?, ?)').run(
    email,
    new Date().toISOString(),
  )

  res.status(201).json({ email })
})

newsletterRouter.get('/newsletter', requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC LIMIT 20000')
    .all() as { email: string; subscribed_at: string }[]

  res.json(rows.map((row) => ({ email: row.email, subscribedAt: row.subscribed_at })))
})

newsletterRouter.delete('/newsletter/:email', requireAdmin, requireOwner, (req, res) => {
  const email = String(req.params.email).toLowerCase()
  db.prepare('DELETE FROM subscribers WHERE email = ?').run(email)
  logActivity(`Eliminó al suscriptor ${email}`, res.locals.admin)
  res.status(204).end()
})
