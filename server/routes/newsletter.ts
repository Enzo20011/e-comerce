import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.ts'
import { requireAdmin } from '../auth.ts'
import { validateBody } from '../validation.ts'

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export const newsletterRouter = Router()

newsletterRouter.post('/newsletter', validateBody(subscribeSchema), (req, res) => {
  const { email } = req.body as z.infer<typeof subscribeSchema>

  db.prepare('INSERT OR IGNORE INTO subscribers (email, subscribed_at) VALUES (?, ?)').run(
    email,
    new Date().toISOString(),
  )

  res.status(201).json({ email })
})

newsletterRouter.get('/newsletter', requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC')
    .all() as { email: string; subscribed_at: string }[]

  res.json(rows.map((row) => ({ email: row.email, subscribedAt: row.subscribed_at })))
})

newsletterRouter.delete('/newsletter/:email', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM subscribers WHERE email = ?').run(String(req.params.email).toLowerCase())
  res.status(204).end()
})
