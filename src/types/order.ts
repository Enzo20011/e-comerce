import type { CartItem } from './cart'

export interface ShippingDetails {
  name: string
  email: string
  address: string
  city: string
  postalCode: string
}

export interface Order {
  orderNumber: string
  items: CartItem[]
  subtotal: number
  shipping: ShippingDetails
  createdAt: string
}
