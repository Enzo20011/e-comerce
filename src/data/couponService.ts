import { apiFetch } from '../lib/api'
import type { Coupon, CouponType } from '../types/order'

export interface NewCouponInput {
  code: string
  type: CouponType
  value: number
  minSubtotal: number
  usageLimit?: number | null
  expiresAt?: string | null
}

export function getCoupons(): Promise<Coupon[]> {
  return apiFetch('/coupons', { auth: true })
}

export function createCoupon(input: NewCouponInput): Promise<Coupon> {
  return apiFetch('/coupons', { method: 'POST', auth: true, body: JSON.stringify(input) })
}

export function toggleCoupon(code: string): Promise<Coupon> {
  return apiFetch(`/coupons/${encodeURIComponent(code)}/toggle`, { method: 'PATCH', auth: true })
}

export function deleteCoupon(code: string): Promise<void> {
  return apiFetch(`/coupons/${encodeURIComponent(code)}`, { method: 'DELETE', auth: true })
}
