import { Router } from 'express'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { requireAdmin } from '../auth.ts'
import { validateBody } from '../validation.ts'
import { productViewLimiter } from '../limiters.ts'
import type { Product } from '../../src/types/product.ts'
import type { OrderItem } from '../../src/types/order.ts'

// Imágenes: ruta local (/images/...) o URL https.
const imageSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((v) => /^\/images\/[\w./-]+$/.test(v) && !v.includes('..') || /^https:\/\/[^\s]+$/.test(v), 'La imagen debe ser una ruta /images/... o una URL https.')

const productSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(5000),
  price: z.number().nonnegative().max(1_000_000_000),
  category: z.string().trim().min(1).max(60),
  image: imageSchema,
  images: z.array(imageSchema).min(1).max(15),
  stock: z.number().int().nonnegative().max(1_000_000),
  rating: z.number().min(0).max(5).optional(),
  featured: z.boolean().optional(),
})

const productUpdateSchema = productSchema.partial()

interface ProductRow {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  images: string
  stock: number
  rating: number | null
  featured: number
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    image: row.image,
    images: JSON.parse(row.images) as string[],
    stock: row.stock,
    rating: row.rating ?? undefined,
    featured: row.featured === 1,
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function recentViewCount(productId: string): number {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const row = db
    .prepare('SELECT COUNT(*) as count FROM product_views WHERE product_id = ? AND viewed_at >= ?')
    .get(productId, since) as unknown as { count: number }
  return row.count
}

export const productsRouter = Router()

productsRouter.get('/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products').all() as unknown as ProductRow[]
  res.json(rows.map(rowToProduct))
})

productsRouter.get('/products/low-stock', requireAdmin, (req, res) => {
  const threshold = Math.min(Math.max(Number(req.query.threshold) || 5, 0), 1000)
  const rows = db
    .prepare('SELECT * FROM products WHERE stock > 0 AND stock <= ? ORDER BY stock ASC')
    .all(threshold) as unknown as ProductRow[]
  res.json(rows.map(rowToProduct))
})

productsRouter.get('/products/:id', productViewLimiter, (req, res) => {
  const id = String(req.params.id)
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as
    | ProductRow
    | undefined
  if (!row) {
    res.status(404).json({ error: 'Producto no encontrado.' })
    return
  }

  db.prepare('INSERT INTO product_views (product_id, viewed_at) VALUES (?, ?)').run(
    id,
    new Date().toISOString(),
  )

  res.json({ ...rowToProduct(row), recentViews: recentViewCount(id) })
})

productsRouter.get('/products/:id/related', (req, res) => {
  const id = String(req.params.id)
  const limit = Math.min(Math.max(Math.trunc(Number(req.query.limit)) || 4, 1), 20)
  const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as
    | ProductRow
    | undefined
  if (!current) {
    res.json([])
    return
  }

  const rows = db
    .prepare('SELECT * FROM products WHERE category = ? AND id != ? LIMIT ?')
    .all(current.category, id, limit) as unknown as ProductRow[]
    
  if (rows.length < limit) {
    const placeholders = [id, ...rows.map(r => r.id)].map(() => '?').join(', ')
    const excludeIds = [id, ...rows.map(r => r.id)]
    const fallbackRows = db
      .prepare(`SELECT * FROM products WHERE id NOT IN (${placeholders}) LIMIT ?`)
      .all(...excludeIds, limit - rows.length) as unknown as ProductRow[]
    rows.push(...fallbackRows)
  }
  
  res.json(rows.map(rowToProduct))
})

productsRouter.get('/products/:id/frequently-bought-with', (req, res) => {
  const targetId = String(req.params.id)
  const limit = Math.min(Math.max(Math.trunc(Number(req.query.limit)) || 4, 1), 20)

  const orderRows = db.prepare('SELECT items FROM orders').all() as unknown as { items: string }[]
  const counts = new Map<string, { product: OrderItem['product']; count: number }>()

  for (const row of orderRows) {
    const items = JSON.parse(row.items) as OrderItem[]
    const hasTarget = items.some((item) => item.product.id === targetId)
    if (!hasTarget) continue

    for (const item of items) {
      if (item.product.id === targetId) continue
      const existing = counts.get(item.product.id)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(item.product.id, { product: item.product, count: 1 })
      }
    }
  }

  const topIds = Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((entry) => entry.product.id)

  if (topIds.length === 0) {
    res.json([])
    return
  }

  const placeholders = topIds.map(() => '?').join(', ')
  const rows = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...topIds) as unknown as ProductRow[]
  const byId = new Map(rows.map((row) => [row.id, rowToProduct(row)]))
  res.json(topIds.map((id) => byId.get(id)).filter((product): product is Product => Boolean(product)))
})

productsRouter.post('/products', requireAdmin, validateBody(productSchema), (req, res) => {
  const data = req.body as z.infer<typeof productSchema>
  const baseSlug = slugify(data.name) || 'producto'
  let id = baseSlug
  let suffix = 2
  while (db.prepare('SELECT 1 FROM products WHERE id = ?').get(id)) {
    id = `${baseSlug}-${suffix}`
    suffix += 1
  }

  db.prepare(`
    INSERT INTO products (id, name, description, price, category, image, images, stock, rating, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.description,
    data.price,
    data.category,
    data.image,
    JSON.stringify(data.images),
    data.stock,
    data.rating ?? null,
    data.featured ? 1 : 0,
  )

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as ProductRow
  logActivity(`Creó el producto "${data.name}"`, res.locals.admin)
  res.status(201).json(rowToProduct(row))
})

productsRouter.put('/products/:id', requireAdmin, validateBody(productUpdateSchema), (req, res) => {
  const id = String(req.params.id)
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as
    | ProductRow
    | undefined
  if (!existing) {
    res.status(404).json({ error: 'Producto no encontrado.' })
    return
  }

  const data = req.body as z.infer<typeof productUpdateSchema>
  const merged = { ...rowToProduct(existing), ...data }

  db.prepare(`
    UPDATE products
    SET name = ?, description = ?, price = ?, category = ?, image = ?, images = ?, stock = ?, rating = ?, featured = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.description,
    merged.price,
    merged.category,
    merged.image,
    JSON.stringify(merged.images),
    merged.stock,
    merged.rating ?? null,
    merged.featured ? 1 : 0,
    id,
  )

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as ProductRow
  logActivity(`Actualizó el producto "${merged.name}"`, res.locals.admin)
  res.json(rowToProduct(row))
})

productsRouter.delete('/products/:id', requireAdmin, (req, res) => {
  const id = String(req.params.id)
  const existing = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as
    | { name: string }
    | undefined
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
  if (existing) logActivity(`Eliminó el producto "${existing.name}"`, res.locals.admin)
  res.status(204).end()
})
