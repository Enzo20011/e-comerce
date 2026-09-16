import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDown, ArrowUp, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllOrders } from '../../data/orderStore'
import { getLowStockProducts } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  getCustomerStats,
  getRevenueComparison,
  getSummaryStats,
  getTopProducts,
  groupRevenueByDay,
  groupRevenueByMonth,
  groupRevenueByYear,
} from '../../utils/analytics'
import { Skeleton } from '../../components/common/Skeleton'
import type { Order } from '../../types/order'
import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

type Period = 'day' | 'month' | 'year'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

export function AdminDashboardPage() {
  useDocumentTitle('Admin — Dashboard')

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [period, setPeriod] = useState<Period>('day')

  useEffect(() => {
    getAllOrders().then(setOrders)
    getLowStockProducts().then(setLowStockProducts)
  }, [])

  const stats = useMemo(() => getSummaryStats(orders ?? []), [orders])
  const topProducts = useMemo(() => getTopProducts(orders ?? []), [orders])
  const revenueComparison = useMemo(() => getRevenueComparison(orders ?? []), [orders])
  const customerStats = useMemo(() => getCustomerStats(orders ?? []), [orders])

  const chartData = useMemo(() => {
    const safeOrders = orders ?? []
    if (period === 'day') return groupRevenueByDay(safeOrders, 30)
    if (period === 'month') return groupRevenueByMonth(safeOrders, 12)
    return groupRevenueByYear(safeOrders)
  }, [orders, period])

  const today = new Date().toISOString().slice(0, 10)
  const ordersToday = (orders ?? []).filter((order) => order.createdAt.startsWith(today)).length

  if (orders === null) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-ink/10 bg-surface/50 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-8 h-96 w-full rounded-2xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Ingresos totales" value={currency.format(stats.totalRevenue)} />
        <StatTile label="Pedidos totales" value={String(stats.totalOrders)} />
        <StatTile label="Ticket promedio" value={currency.format(stats.averageOrderValue)} />
        <StatTile label="Pedidos hoy" value={String(ordersToday)} />
        <StatTile
          label="Clientes recurrentes"
          value={`${customerStats.repeatRate.toFixed(0)}%`}
          hint={`${customerStats.repeatCustomers} de ${customerStats.totalCustomers} clientes`}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-surface/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Ingresos</h2>
            {revenueComparison.changePercent !== null && (
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  revenueComparison.changePercent >= 0
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-accent/15 text-accent'
                }`}
              >
                {revenueComparison.changePercent >= 0 ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                {Math.abs(revenueComparison.changePercent).toFixed(1)}% vs. 30 días anteriores
              </span>
            )}
          </div>
          <div className="flex gap-1 rounded-full border border-ink/10 p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  period === option.value ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-ink)"
                strokeOpacity={0.08}
              />
              <XAxis
                dataKey="label"
                tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--color-ink)', fillOpacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--color-ink)', fillOpacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                width={90}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `US$ ${Math.round(value / 1000)}k` : `US$ ${value}`
                }
              />
              <Tooltip
                formatter={(value) => [
                  currency.format(Number(Array.isArray(value) ? value[0] : value)),
                  'Ingresos',
                ]}
                contentStyle={{
                  fontFamily: 'Inter',
                  fontSize: 13,
                  borderRadius: 12,
                  border: '1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                }}
              />
              <Bar dataKey="revenue" name="Ingresos" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-surface/50 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10">
              {topProducts.map((product, index) => (
                <li key={product.productId} className="flex items-center gap-3 py-2.5">
                  <span className="w-4 text-xs font-semibold text-ink/40">{index + 1}</span>
                  <img src={product.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <span className="flex-1 truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="text-xs text-ink/50">{product.quantitySold} vendidos</span>
                  <span className="text-sm font-semibold text-ink">
                    {currency.format(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-surface/50 p-6">
          <div className="flex items-center gap-2">
            <TriangleAlert size={17} className="text-accent" />
            <h2 className="font-display text-lg font-semibold text-ink">Stock bajo</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Todos los productos tienen stock saludable.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3 py-2.5">
                  <img src={product.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="flex-1 truncate text-sm font-medium text-ink transition-colors hover:text-accent"
                  >
                    {product.name}
                  </Link>
                  <span className="rounded-full bg-accent-2/20 px-2.5 py-1 text-xs font-semibold text-accent-2">
                    {product.stock} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-surface/50 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  )
}
