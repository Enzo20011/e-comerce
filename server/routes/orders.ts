import { Router } from 'express'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { requireAdmin } from '../auth.ts'
import { validateBody } from '../validation.ts'
import { orderCreateLimiter, orderLookupLimiter } from '../limiters.ts'
import { checkCouponValidity, getCouponByCode } from './coupons.ts'
import { generateOrderNumber } from '../../src/utils/order.ts'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../src/types/order.ts'
import type { Order, OrderStatus } from '../../src/types/order.ts'

interface OrderRow {
  order_number: string
  items: string
  subtotal: number
  shipping: string
  created_at: string
  status: string
  discount_code: string | null
  discount_amount: number
}

function rowToOrder(row: OrderRow): Order {
  return {
    orderNumber: row.order_number,
    items: JSON.parse(row.items),
    subtotal: row.subtotal,
    shipping: JSON.parse(row.shipping),
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    discountCode: row.discount_code,
    discountAmount: row.discount_amount,
  }
}

const shippingSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá tu nombre y apellido.').max(120),
  email: z.string().trim().toLowerCase().email('Ingresá un email válido.').max(200),
  address: z.string().trim().min(1, 'Ingresá tu dirección.').max(200),
  city: z.string().trim().min(1, 'Ingresá tu ciudad.').max(100),
  postalCode: z.string().trim().min(1, 'Ingresá tu código postal.').max(20),
})

const newOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.object({ id: z.string().min(1).max(100) }).passthrough(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1, 'El pedido no tiene items.')
    .max(50),
  shipping: shippingSchema,
  couponCode: z.string().trim().min(1).max(30).optional(),
})

// Transiciones permitidas desde cada estado.
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['enviado', 'cancelado'],
  enviado: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
}

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
})

export const ordersRouter = Router()

// Sin parámetros devuelve hasta 5000 pedidos (dashboard/clientes). Con `page` devuelve una página
// filtrada en el servidor: { items, total, page, pageSize }. Con `export=1`, hasta 10000 filas filtradas.
ordersRouter.get('/orders', requireAdmin, (req, res) => {
  const status = String(req.query.status ?? '')
  const term = String(req.query.q ?? '').trim().toLowerCase()
  const where: string[] = []
  const params: (string | number)[] = []
  if (ORDER_STATUSES.includes(status as OrderStatus)) {
    where.push('status = ?')
    params.push(status)
  }
  if (term) {
    const like = `%${term.replace(/[\\%_]/g, '\\$&')}%`
    where.push("(LOWER(order_number) LIKE ? ESCAPE '\\' OR LOWER(shipping) LIKE ? ESCAPE '\\')")
    params.push(like, like)
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  if (req.query.page === undefined) {
    const limit = req.query.export ? 10000 : 5000
    const rows = db
      .prepare(`SELECT * FROM orders ${clause} ORDER BY created_at DESC LIMIT ?`)
      .all(...params, limit) as unknown as OrderRow[]
    res.json(rows.map(rowToOrder))
    return
  }

  const pageSize = Math.min(Math.max(Math.trunc(Number(req.query.pageSize)) || 15, 1), 100)
  const page = Math.max(Math.trunc(Number(req.query.page)) || 1, 1)
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM orders ${clause}`).get(...params) as unknown as {
    total: number
  }
  const rows = db
    .prepare(`SELECT * FROM orders ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize) as unknown as OrderRow[]
  res.json({ items: rows.map(rowToOrder), total, page, pageSize })
})

ordersRouter.get('/orders/find', orderLookupLimiter, (req, res) => {
  const orderNumber = String(req.query.orderNumber ?? '').trim().toUpperCase()
  const email = String(req.query.email ?? '').trim().toLowerCase()

  if (!orderNumber || !email) {
    res.status(400).json({ error: 'Falta el número de pedido o el email.' })
    return
  }

  const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as unknown as
    | OrderRow
    | undefined
  const match =
    row && (JSON.parse(row.shipping).email ?? '').trim().toLowerCase() === email ? row : undefined

  if (!match) {
    res.status(404).json({ error: 'No encontramos ningún pedido con esos datos.' })
    return
  }

  res.json(rowToOrder(match))
})

class OrderError extends Error {}

ordersRouter.post('/orders', orderCreateLimiter, validateBody(newOrderSchema), (req, res) => {
  const input = req.body as z.infer<typeof newOrderSchema>

  // Agrupa líneas repetidas del mismo producto.
  const quantities = new Map<string, number>()
  for (const item of input.items) {
    quantities.set(item.product.id, (quantities.get(item.product.id) ?? 0) + item.quantity)
  }

  let order: Order
  try {
    db.exec('BEGIN IMMEDIATE')
    try {
      const productRow = db.prepare('SELECT id, name, price, image, stock FROM products WHERE id = ?')
      const decrement = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?')

      // Precios y nombres salen siempre de la base, nunca del cliente.
      const items: Order['items'] = []
      let subtotal = 0
      for (const [id, quantity] of quantities) {
        const product = productRow.get(id) as
          | { id: string; name: string; price: number; image: string; stock: number }
          | undefined
        if (!product) throw new OrderError('Uno de los productos ya no está disponible.')
        if (product.stock < quantity || decrement.run(quantity, id, quantity).changes === 0) {
          throw new OrderError(
            product.stock === 0
              ? `"${product.name}" se quedó sin stock.`
              : `Solo quedan ${product.stock} unidades de "${product.name}".`,
          )
        }
        items.push({
          product: { id: product.id, name: product.name, price: product.price, image: product.image },
          quantity,
        })
        subtotal += product.price * quantity
      }

      let discountCode: string | null = null
      let discountAmount = 0
      if (input.couponCode) {
        const coupon = getCouponByCode(input.couponCode)
        const validation = checkCouponValidity(coupon, subtotal)
        if (!validation.valid) throw new OrderError(validation.message)
        const claimed = db
          .prepare(
            'UPDATE coupons SET used_count = used_count + 1 WHERE code = ? AND (usage_limit IS NULL OR used_count < usage_limit)',
          )
          .run(coupon!.code)
        if (claimed.changes === 0) throw new OrderError('Ese cupón alcanzó el límite de usos.')
        discountCode = coupon!.code
        discountAmount = validation.discountAmount
      }

      order = {
        orderNumber: generateOrderNumber(),
        items,
        subtotal,
        shipping: input.shipping,
        createdAt: new Date().toISOString(),
        status: 'pendiente',
        discountCode,
        discountAmount,
      }

      db.prepare(`
        INSERT INTO orders (order_number, items, subtotal, shipping, created_at, status, discount_code, discount_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        order.orderNumber,
        JSON.stringify(order.items),
        order.subtotal,
        JSON.stringify(order.shipping),
        order.createdAt,
        order.status,
        order.discountCode,
        order.discountAmount,
      )
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  } catch (error) {
    if (error instanceof OrderError) {
      res.status(409).json({ error: error.message })
      return
    }
    throw error
  }

  logActivity(`Nuevo pedido ${order.orderNumber} de ${order.shipping.name}`)
  res.status(201).json(order)
})

ordersRouter.patch('/orders/:orderNumber/status', requireAdmin, validateBody(statusSchema), (req, res) => {
  const orderNumber = String(req.params.orderNumber)
  const { status } = req.body as z.infer<typeof statusSchema>

  const current = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as unknown as
    | OrderRow
    | undefined
  if (!current) {
    res.status(404).json({ error: 'Pedido no encontrado.' })
    return
  }

  if (!STATUS_TRANSITIONS[current.status as OrderStatus]?.includes(status)) {
    res.status(409).json({
      error: `No se puede pasar un pedido de "${ORDER_STATUS_LABELS[current.status as OrderStatus]}" a "${ORDER_STATUS_LABELS[status]}".`,
    })
    return
  }

  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare('UPDATE orders SET status = ? WHERE order_number = ?').run(status, orderNumber)
    if (status === 'cancelado') {
      // Al cancelar se repone el stock y se libera el uso del cupón.
      const restock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?')
      for (const item of JSON.parse(current.items) as Order['items']) {
        restock.run(item.quantity, item.product.id)
      }
      if (current.discount_code) {
        db.prepare('UPDATE coupons SET used_count = MAX(0, used_count - 1) WHERE code = ?').run(current.discount_code)
      }
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  logActivity(`Pedido ${orderNumber} marcado como "${ORDER_STATUS_LABELS[status]}"`, res.locals.admin)

  const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as unknown as OrderRow
  res.json(rowToOrder(row))
})
