import { Router } from 'express'
import { db, logActivity } from '../db.ts'
import { requireAdmin } from '../auth.ts'

interface ReviewRow {
  id: string
  product_id: string
  author: string
  rating: number
  date: string
  title: string
  body: string
  hidden: number
}

function rowToReview(row: ReviewRow) {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: row.rating,
    date: row.date,
    title: row.title,
    body: row.body,
  }
}

export const reviewsRouter = Router()

reviewsRouter.get('/products/:id/reviews', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM reviews WHERE product_id = ? AND hidden = 0')
    .all(String(req.params.id)) as unknown as ReviewRow[]
  res.json(rows.map(rowToReview))
})

reviewsRouter.get('/reviews', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT reviews.*, products.name as product_name
       FROM reviews
       JOIN products ON products.id = reviews.product_id`,
    )
    .all() as unknown as (ReviewRow & { product_name: string })[]

  res.json(
    rows.map((row) => ({
      ...rowToReview(row),
      productName: row.product_name,
      hidden: row.hidden === 1,
    })),
  )
})

reviewsRouter.patch('/reviews/:id/hide', requireAdmin, (req, res) => {
  const id = String(req.params.id)
  const result = db.prepare('UPDATE reviews SET hidden = 1 WHERE id = ?').run(id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Reseña no encontrada.' })
    return
  }
  logActivity(`Ocultó una reseña`)
  res.status(204).end()
})

reviewsRouter.patch('/reviews/:id/restore', requireAdmin, (req, res) => {
  const id = String(req.params.id)
  const result = db.prepare('UPDATE reviews SET hidden = 0 WHERE id = ?').run(id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Reseña no encontrada.' })
    return
  }
  logActivity(`Restauró una reseña`)
  res.status(204).end()
})
