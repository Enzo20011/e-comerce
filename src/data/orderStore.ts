import type { Order } from '../types/order'
import { generateOrderNumber } from '../utils/order'
import { getAllProducts } from './productService'

const STORAGE_KEY = 'ecomerce.orders'

export const FLAT_SHIPPING = 5.99

const FAKE_SHIPPING = {
  name: 'Juan Pérez',
  email: 'juan.perez@example.com',
  address: 'Av. Siempreviva 742',
  city: 'Buenos Aires',
  postalCode: 'C1000',
}

export function getAllOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

export function addOrder(order: Order): void {
  try {
    const orders = getAllOrders()
    orders.push(order)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // almacenamiento no disponible
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildHistoricalOrder(date: Date, index: number, products: ReturnType<typeof getAllProducts>): Order {
  const itemCount = randomInt(1, 3)
  const items = Array.from({ length: itemCount }, () => {
    const product = products[randomInt(0, products.length - 1)]
    return { product, quantity: randomInt(1, 3) }
  })

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const createdAt = new Date(date)
  createdAt.setHours(randomInt(8, 21), randomInt(0, 59), 0, 0)

  return {
    orderNumber: `${generateOrderNumber()}-${index}`,
    items,
    subtotal,
    shipping: FAKE_SHIPPING,
    createdAt: createdAt.toISOString(),
  }
}

export function seedHistoricalOrdersIfEmpty(): void {
  if (getAllOrders().length > 0) return

  const products = getAllProducts()
  if (products.length === 0) return

  const orders: Order[] = []
  const today = new Date()
  const DAYS_BACK = 150

  for (let daysAgo = DAYS_BACK; daysAgo >= 0; daysAgo--) {
    const day = new Date(today)
    day.setDate(day.getDate() - daysAgo)

    const hasOrders = Math.random() < 0.85
    if (!hasOrders) continue

    const isBusyDay = daysAgo % 20 === 0
    const orderCount = isBusyDay ? randomInt(5, 9) : randomInt(1, 4)

    for (let i = 0; i < orderCount; i++) {
      orders.push(buildHistoricalOrder(day, orders.length, products))
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // almacenamiento no disponible
  }
}
