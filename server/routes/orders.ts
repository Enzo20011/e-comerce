import { Router } from 'express'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { requireAdmin } from '../auth.ts'
import { validateBody } from '../validation.ts'
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
  name: z.string().trim().min(1, 'Ingresá tu nombre y apellido.'),
  email: z.string().trim().toLowerCase().email('Ingresá un email válido.'),
  address: z.string().trim().min(1, 'Ingresá tu dirección.'),
  city: z.string().trim().min(1, 'Ingresá tu ciudad.'),
  postalCode: z.string().trim().min(1, 'Ingresá tu código postal.'),
})

const newOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          price: z.number().nonnegative(),
          image: z.string(),
        }),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'El pedido no tiene items.'),
  subtotal: z.number().nonnegative(),
  shipping: shippingSchema,
  couponCode: z.string().trim().min(1).optional(),
})

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
})

export const ordersRouter = Router()

ordersRouter.get('/orders', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as unknown as OrderRow[]
  res.json(rows.map(rowToOrder))
})

ordersRouter.get('/orders/find', (req, res) => {
  const orderNumber = String(req.query.orderNumber ?? '').trim().toUpperCase()
  const email = String(req.query.email ?? '').trim().toLowerCase()

  if (!orderNumber || !email) {
    res.status(400).json({ error: 'Falta el número de pedido o el email.' })
    return
  }

  const rows = db
    .prepare('SELECT * FROM orders WHERE UPPER(order_number) = ?')
    .all(orderNumber) as unknown as OrderRow[]
  const match = rows.find((row) => (JSON.parse(row.shipping).email ?? '').trim().toLowerCase() === email)

  if (!match) {
    res.status(404).json({ error: 'No encontramos ningún pedido con esos datos.' })
    return
  }

  res.json(rowToOrder(match))
})

ordersRouter.post('/orders', validateBody(newOrderSchema), (req, res) => {
  const input = req.body as z.infer<typeof newOrderSchema>

  const stockRow = db.prepare('SELECT id, name, stock FROM products WHERE id = ?')
  for (const item of input.items) {
    const product = stockRow.get(item.product.id) as { id: string; name: string; stock: number } | undefined
    if (!product) {
      res.status(409).json({ error: `"${item.product.name}" ya no está disponible.` })
      return
    }
    if (product.stock < item.quantity) {
      res.status(409).json({
        error:
          product.stock === 0
            ? `"${product.name}" se quedó sin stock.`
            : `Solo quedan ${product.stock} unidades de "${product.name}".`,
      })
      return
    }
  }

  let discountCode: string | null = null
  let discountAmount = 0
  if (input.couponCode) {
    const coupon = getCouponByCode(input.couponCode)
    const validation = checkCouponValidity(coupon, input.subtotal)
    if (!validation.valid) {
      res.status(409).json({ error: validation.message })
      return
    }
    discountCode = coupon!.code
    discountAmount = validation.discountAmount
  }

  const decrement = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
  for (const item of input.items) {
    decrement.run(item.quantity, item.product.id)
  }

  if (discountCode) {
    db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(discountCode)
  }

  const order: Order = {
    orderNumber: generateOrderNumber(),
    items: input.items,
    subtotal: input.subtotal,
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

  logActivity(`Nuevo pedido ${order.orderNumber} de ${order.shipping.name}`)
  res.status(201).json(order)
})

ordersRouter.patch('/orders/:orderNumber/status', requireAdmin, validateBody(statusSchema), (req, res) => {
  const orderNumber = String(req.params.orderNumber)
  const { status } = req.body as z.infer<typeof statusSchema>

  const result = db.prepare('UPDATE orders SET status = ? WHERE order_number = ?').run(status, orderNumber)

  if (result.changes === 0) {
    res.status(404).json({ error: 'Pedido no encontrado.' })
    return
  }

  logActivity(`Pedido ${orderNumber} marcado como "${ORDER_STATUS_LABELS[status]}"`)

  const row = db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .get(orderNumber) as unknown as OrderRow
  res.json(rowToOrder(row))
})
