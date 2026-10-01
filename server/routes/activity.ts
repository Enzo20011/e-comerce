import { Router } from 'express'
import { db } from '../db.ts'
import { requireAdmin } from '../auth.ts'

interface ActivityRow {
  id: number
  action: string
  created_at: string
  actor: string | null
}

export const activityRouter = Router()

activityRouter.get('/activity', requireAdmin, (req, res) => {
  const limit = Math.min(Math.max(Math.trunc(Number(req.query.limit)) || 50, 1), 500)
  const rows = db
    .prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?')
    .all(limit) as unknown as ActivityRow[]

  res.json(rows.map((row) => ({ id: row.id, action: row.action, createdAt: row.created_at, actor: row.actor })))
})
