import type { Order } from '../types/order'
import { FLAT_SHIPPING } from '../data/orderStore'

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
  return order.subtotal + FLAT_SHIPPING
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
