import type { Order } from '../types/order'
import { getOrderTotal } from '../data/orderStore'

export interface RevenuePoint {
  label: string
  revenue: number
  orderCount: number
}

export interface SummaryStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
}

function orderTotal(order: Order): number {
  return getOrderTotal(order.subtotal, order.discountAmount)
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const MONTH_LABELS = new Intl.DateTimeFormat('es-AR', { month: 'short', year: '2-digit' })
const DAY_LABELS = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' })

export function groupRevenueByDay(orders: Order[], days = 30): RevenuePoint[] {
  const buckets = new Map<string, RevenuePoint>()
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    buckets.set(dayKey(date), { label: DAY_LABELS.format(date), revenue: 0, orderCount: 0 })
  }

  for (const order of orders) {
    const key = order.createdAt.slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.revenue += orderTotal(order)
    bucket.orderCount += 1
  }

  return Array.from(buckets.values())
}

export function groupRevenueByMonth(orders: Order[], months = 12): RevenuePoint[] {
  const buckets = new Map<string, RevenuePoint>()
  const today = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, { label: MONTH_LABELS.format(date), revenue: 0, orderCount: 0 })
  }

  for (const order of orders) {
    const date = new Date(order.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.revenue += orderTotal(order)
    bucket.orderCount += 1
  }

  return Array.from(buckets.values())
}

export function groupRevenueByYear(orders: Order[]): RevenuePoint[] {
  if (orders.length === 0) return []

  const years = orders.map((order) => new Date(order.createdAt).getFullYear())
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years, new Date().getFullYear())

  const buckets = new Map<number, RevenuePoint>()
  for (let year = minYear; year <= maxYear; year++) {
    buckets.set(year, { label: String(year), revenue: 0, orderCount: 0 })
  }

  for (const order of orders) {
    const year = new Date(order.createdAt).getFullYear()
    const bucket = buckets.get(year)
    if (!bucket) continue
    bucket.revenue += orderTotal(order)
    bucket.orderCount += 1
  }

  return Array.from(buckets.values())
}

export function getSummaryStats(orders: Order[]): SummaryStats {
  const totalRevenue = orders.reduce((sum, order) => sum + orderTotal(order), 0)
  const totalOrders = orders.length
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  }
}

export interface CustomerStats {
  totalCustomers: number
  repeatCustomers: number
  repeatRate: number
}

export function getCustomerStats(orders: Order[]): CustomerStats {
  const ordersByEmail = new Map<string, number>()
  for (const order of orders) {
    const email = order.shipping.email.trim().toLowerCase()
    ordersByEmail.set(email, (ordersByEmail.get(email) ?? 0) + 1)
  }

  const totalCustomers = ordersByEmail.size
  const repeatCustomers = Array.from(ordersByEmail.values()).filter((count) => count > 1).length

  return {
    totalCustomers,
    repeatCustomers,
    repeatRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
  }
}

export interface Customer {
  email: string
  name: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

export function getCustomers(orders: Order[]): Customer[] {
  const byEmail = new Map<string, Customer>()

  for (const order of orders) {
    const email = order.shipping.email.trim().toLowerCase()
    const total = orderTotal(order)
    const existing = byEmail.get(email)

    if (existing) {
      existing.orderCount += 1
      existing.totalSpent += total
      if (order.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = order.createdAt
        existing.name = order.shipping.name
      }
    } else {
      byEmail.set(email, {
        email,
        name: order.shipping.name,
        orderCount: 1,
        totalSpent: total,
        lastOrderAt: order.createdAt,
      })
    }
  }

  return Array.from(byEmail.values()).sort((a, b) => b.totalSpent - a.totalSpent)
}

export interface TopProduct {
  productId: string
  name: string
  image: string
  quantitySold: number
  revenue: number
}

export function getTopProducts(orders: Order[], limit = 5): TopProduct[] {
  const byProduct = new Map<string, TopProduct>()

  for (const order of orders) {
    for (const item of order.items) {
      const existing = byProduct.get(item.product.id)
      const revenue = item.product.price * item.quantity
      if (existing) {
        existing.quantitySold += item.quantity
        existing.revenue += revenue
      } else {
        byProduct.set(item.product.id, {
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          quantitySold: item.quantity,
          revenue,
        })
      }
    }
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit)
}

export interface PeriodComparison {
  currentRevenue: number
  previousRevenue: number
  changePercent: number | null
}

export function getRevenueComparison(orders: Order[], days = 30): PeriodComparison {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const currentStart = now - days * dayMs
  const previousStart = now - days * 2 * dayMs

  let currentRevenue = 0
  let previousRevenue = 0

  for (const order of orders) {
    const timestamp = new Date(order.createdAt).getTime()
    if (timestamp >= currentStart) {
      currentRevenue += orderTotal(order)
    } else if (timestamp >= previousStart) {
      previousRevenue += orderTotal(order)
    }
  }

  const changePercent =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : null

  return { currentRevenue, previousRevenue, changePercent }
}
