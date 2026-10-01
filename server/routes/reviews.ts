import { Router } from 'express'
import { db, logActivity } from '../db.ts'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '../auth.ts'
import { validateBody } from '../validation.ts'
import { reviewCreateLimiter } from '../limiters.ts'

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

const reviewSchema = z.object({
  author: z.string().trim().min(2, 'Ingresá tu nombre.').max(60),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(2, 'Ingresá un título.').max(100),
  body: z.string().trim().min(5, 'Escribí tu opinión.').max(2000),
})

export const reviewsRouter = Router()

// Las reseñas nuevas quedan ocultas hasta que un admin las aprueba (Reseñas → Restaurar).
reviewsRouter.post('/products/:id/reviews', reviewCreateLimiter, validateBody(reviewSchema), (req, res) => {
  const productId = String(req.params.id)
  if (!db.prepare('SELECT 1 FROM products WHERE id = ?').get(productId)) {
    res.status(404).json({ error: 'Producto no encontrado.' })
    return
  }
  const data = req.body as z.infer<typeof reviewSchema>
  db.prepare(
    'INSERT INTO reviews (id, product_id, author, rating, date, title, body, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
  ).run(randomUUID(), productId, data.author, data.rating, 'recién', data.title, data.body)
  logActivity(`Nueva reseña pendiente de moderación en "${productId}"`)
  res.status(202).json({ message: 'Gracias. Tu reseña se publicará después de ser revisada.' })
})

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
       JOIN products ON products.id = reviews.product_id
       ORDER BY reviews.rowid DESC LIMIT 5000`,
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
  logActivity(`Ocultó una reseña`, res.locals.admin)
  res.status(204).end()
})

reviewsRouter.patch('/reviews/:id/restore', requireAdmin, (req, res) => {
  const id = String(req.params.id)
  const result = db.prepare('UPDATE reviews SET hidden = 0 WHERE id = ?').run(id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Reseña no encontrada.' })
    return
  }
  logActivity(`Restauró una reseña`, res.locals.admin)
  res.status(204).end()
})
