import { Router } from 'express'
import { z } from 'zod'
import { db, logActivity } from '../db.ts'
import { requireAdmin } from '../auth.ts'
import { validateBody } from '../validation.ts'
import type { Coupon, CouponType, CouponValidationResult } from '../../src/types/order.ts'

interface CouponRow {
  code: string
  type: string
  value: number
  active: number
  min_subtotal: number
  usage_limit: number | null
  used_count: number
  expires_at: string | null
  created_at: string
}

function rowToCoupon(row: CouponRow): Coupon {
  return {
    code: row.code,
    type: row.type as CouponType,
    value: row.value,
    active: row.active === 1,
    minSubtotal: row.min_subtotal,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }
}

export function computeDiscount(coupon: Coupon, subtotal: number): number {
  const raw = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  return Math.min(subtotal, Math.max(0, raw))
}

export function checkCouponValidity(coupon: Coupon | undefined, subtotal: number): CouponValidationResult {
  if (!coupon) return { valid: false, message: 'Ese cupón no existe.', discountAmount: 0 }
  if (!coupon.active) return { valid: false, message: 'Ese cupón ya no está activo.', discountAmount: 0 }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: 'Ese cupón venció.', discountAmount: 0 }
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Ese cupón alcanzó el límite de usos.', discountAmount: 0 }
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      message: `Este cupón requiere un mínimo de compra de US$ ${coupon.minSubtotal.toFixed(2)}.`,
      discountAmount: 0,
    }
  }

  const discountAmount = computeDiscount(coupon, subtotal)
  return {
    valid: true,
    message:
      coupon.type === 'percent'
        ? `${coupon.value}% de descuento aplicado.`
        : `US$ ${coupon.value.toFixed(2)} de descuento aplicado.`,
    discountAmount,
  }
}

export function getCouponByCode(code: string): Coupon | undefined {
  const row = db
    .prepare('SELECT * FROM coupons WHERE UPPER(code) = ?')
    .get(code.trim().toUpperCase()) as unknown as CouponRow | undefined
  return row ? rowToCoupon(row) : undefined
}

const couponSchema = z.object({
  code: z.string().trim().min(2).max(30),
  type: z.enum(['percent', 'fixed']),
  value: z.number().positive(),
  minSubtotal: z.number().nonnegative().default(0),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
})

export const couponsRouter = Router()

couponsRouter.get('/coupons', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all() as unknown as CouponRow[]
  res.json(rows.map(rowToCoupon))
})

couponsRouter.get('/coupons/:code/validate', (req, res) => {
  const subtotal = Number(req.query.subtotal) || 0
  const coupon = getCouponByCode(String(req.params.code))
  res.json(checkCouponValidity(coupon, subtotal))
})

couponsRouter.post('/coupons', requireAdmin, validateBody(couponSchema), (req, res) => {
  const data = req.body as z.infer<typeof couponSchema>
  const code = data.code.toUpperCase()

  const existing = getCouponByCode(code)
  if (existing) {
    res.status(409).json({ error: 'Ya existe un cupón con ese código.' })
    return
  }

  db.prepare(`
    INSERT INTO coupons (code, type, value, active, min_subtotal, usage_limit, used_count, expires_at, created_at)
    VALUES (?, ?, ?, 1, ?, ?, 0, ?, ?)
  `).run(
    code,
    data.type,
    data.value,
    data.minSubtotal,
    data.usageLimit ?? null,
    data.expiresAt ?? null,
    new Date().toISOString(),
  )

  logActivity(`Creó el cupón "${code}"`)
  res.status(201).json(getCouponByCode(code))
})

couponsRouter.patch('/coupons/:code/toggle', requireAdmin, (req, res) => {
  const coupon = getCouponByCode(String(req.params.code))
  if (!coupon) {
    res.status(404).json({ error: 'Cupón no encontrado.' })
    return
  }

  db.prepare('UPDATE coupons SET active = ? WHERE code = ?').run(coupon.active ? 0 : 1, coupon.code)
  logActivity(`${coupon.active ? 'Desactivó' : 'Activó'} el cupón "${coupon.code}"`)
  res.json(getCouponByCode(coupon.code))
})

couponsRouter.delete('/coupons/:code', requireAdmin, (req, res) => {
  const code = String(req.params.code).toUpperCase()
  db.prepare('DELETE FROM coupons WHERE code = ?').run(code)
  logActivity(`Eliminó el cupón "${code}"`)
  res.status(204).end()
})
