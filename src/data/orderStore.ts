import { apiFetch, ApiError } from '../lib/api'
import type { CouponValidationResult, NewOrderInput, Order, OrderStatus } from '../types/order'

// Amounts in ARS (base currency). ~1 USD ≈ 1200 ARS at time of writing.
export const FLAT_SHIPPING = 7200          // ~$5.99 USD
export const FREE_SHIPPING_THRESHOLD = 90000 // ~$75 USD

export function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
}

export function getOrderTotal(subtotal: number, discountAmount = 0): number {
  const discounted = Math.max(0, subtotal - discountAmount)
  return discounted + getShippingCost(discounted)
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const params = new URLSearchParams({ subtotal: String(subtotal) })
  try {
    return await apiFetch<CouponValidationResult>(
      `/coupons/${encodeURIComponent(code)}/validate?${params.toString()}`,
    )
  } catch (error) {
    if (error instanceof ApiError) return { valid: false, message: error.message, discountAmount: 0 }
    throw error
  }
}

export function getAllOrders(): Promise<Order[]> {
  return apiFetch('/orders', { auth: true })
}

export function addOrder(input: NewOrderInput): Promise<Order> {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(input) })
}

export function updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<Order> {
  return apiFetch(`/orders/${orderNumber}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  })
}

export async function findOrder(orderNumber: string, email: string): Promise<Order | undefined> {
  try {
    const params = new URLSearchParams({ orderNumber, email })
    return await apiFetch<Order>(`/orders/find?${params.toString()}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}
