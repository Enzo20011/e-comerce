export interface ShippingDetails {
  name: string
  email: string
  address: string
  city: string
  postalCode: string
}

export type OrderStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado'

export const ORDER_STATUSES: OrderStatus[] = ['pendiente', 'enviado', 'entregado', 'cancelado']

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

/** Snapshot of a product as it was at the time of purchase — not the live Product record. */
export interface OrderItemProduct {
  id: string
  name: string
  price: number
  image: string
}

export interface OrderItem {
  product: OrderItemProduct
  quantity: number
}

export interface Order {
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: ShippingDetails
  createdAt: string
  status: OrderStatus
  discountCode: string | null
  discountAmount: number
}

export interface NewOrderInput {
  items: OrderItem[]
  subtotal: number
  shipping: ShippingDetails
  couponCode?: string
}

export type CouponType = 'percent' | 'fixed'

export interface Coupon {
  code: string
  type: CouponType
  value: number
  active: boolean
  minSubtotal: number
  usageLimit: number | null
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

export interface CouponValidationResult {
  valid: boolean
  message: string
  discountAmount: number
}
