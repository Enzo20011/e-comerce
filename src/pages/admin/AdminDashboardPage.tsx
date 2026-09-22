import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { ArrowDown, ArrowUp, TriangleAlert, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllOrders } from '../../data/orderStore'
import { getAllProducts, getLowStockProducts } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  getCustomerStats,
  getRevenueComparison,
  getSummaryStats,
  getTopProducts,
  groupRevenueByDay,
  groupRevenueByMonth,
  groupRevenueByYear,
  getRevenueByCategory,
} from '../../utils/analytics'
import { Skeleton } from '../../components/common/Skeleton'
import type { Order } from '../../types/order'
import type { Product } from '../../types/product'



type Period = 'day' | 'month' | 'year'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

export function AdminDashboardPage() {
  const { formatPrice } = useCurrency()
  useDocumentTitle('Admin — Dashboard')

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [period, setPeriod] = useState<Period>('day')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    getAllOrders().then(setOrders)
    getLowStockProducts().then(setLowStockProducts)
    getAllProducts().then(setProducts)
  }, [])

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    if (!selectedDate) return orders
    return orders.filter(o => o.createdAt.startsWith(selectedDate))
  }, [orders, selectedDate])

  const stats = useMemo(() => getSummaryStats(filteredOrders), [filteredOrders])
  const topProducts = useMemo(() => getTopProducts(filteredOrders), [filteredOrders])
  const revenueComparison = useMemo(() => getRevenueComparison(orders ?? []), [orders])
  const customerStats = useMemo(() => getCustomerStats(filteredOrders), [filteredOrders])
  const categoryRevenue = useMemo(() => getRevenueByCategory(filteredOrders, products), [filteredOrders, products])

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
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Dashboard</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="rounded-xl border border-ink/10 bg-surface p-5 shadow-sm">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-96 w-full rounded-xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Dashboard</h1>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="flex items-center gap-1.5 rounded-lg bg-ink/5 px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
          >
            <X size={14} />
            Limpiar filtro: {selectedDate}
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Ingresos totales" value={formatPrice(stats.totalRevenue)} />
        <StatTile label="Pedidos totales" value={String(stats.totalOrders)} />
        <StatTile label="Ticket promedio" value={formatPrice(stats.averageOrderValue)} />
        <StatTile label="Pedidos hoy" value={String(ordersToday)} />
        <StatTile
          label="Clientes recurrentes"
          value={`${customerStats.repeatRate.toFixed(0)}%`}
          hint={`${customerStats.repeatCustomers} de ${customerStats.totalCustomers}`}
        />
      </div>

      <div className="mt-6 rounded-xl border border-ink/10 bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">Ingresos</h2>
            {revenueComparison.changePercent !== null && (
              <span
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                  revenueComparison.changePercent >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
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
          <div className="flex gap-1 rounded-md border border-ink/10 bg-surface/50 p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setPeriod(option.value)
                  setSelectedDate(null)
                }}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  period === option.value 
                    ? 'bg-paper text-ink shadow-sm' 
                    : 'text-ink/50 hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-ink)"
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: 'var(--color-ink)', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                dy={10}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-ink)', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                width={100}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `US$ ${Math.round(value / 1000)}k` : `US$ ${value}`
                }
              />
              <Tooltip
                cursor={{ fill: 'var(--color-ink)', opacity: 0.05 }}
                formatter={(value) => [
                  formatPrice(Number(Array.isArray(value) ? value[0] : value)),
                  'Ingresos',
                ]}
                contentStyle={{
                  fontSize: 13,
                  borderRadius: 8,
                  border: '1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ color: 'var(--color-ink)' }}
              />
              <Bar 
                dataKey="revenue" 
                name="Ingresos" 
                fill="var(--color-accent)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
                activeBar={{ fill: 'var(--color-accent-vivid)' }}
                cursor="pointer"
                onClick={(data: any) => {
                  if (data && data.rawDate) {
                    setSelectedDate(data.rawDate)
                  }
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedDate === entry.rawDate ? 'var(--color-accent-vivid)' : 'var(--color-accent)'} 
                    opacity={selectedDate && selectedDate !== entry.rawDate ? 0.4 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">
            Productos más vendidos {selectedDate && <span className="text-sm font-normal text-ink/50 ml-1">({selectedDate})</span>}
          </h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/5">
              {topProducts.map((product, index) => (
                <li key={product.productId} className="flex items-center gap-4 py-3">
                  <span className="w-5 text-sm font-semibold text-ink/40">{index + 1}</span>
                  <img src={product.image} alt="" className="h-10 w-10 rounded border border-ink/5 object-cover" />
                  <span className="flex-1 truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="text-xs text-ink/50">{product.quantitySold} vendidos</span>
                  <span className="text-sm font-semibold text-ink">
                    {formatPrice(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink/10 bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <TriangleAlert size={18} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-ink">Stock bajo</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Todos los productos tienen stock saludable.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/5">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-4 py-3">
                  <img src={product.image} alt="" className="h-10 w-10 rounded border border-ink/5 object-cover" />
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="flex-1 truncate text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span className="rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20">
                    {product.stock} disponibles
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink/10 bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Ingresos por categoría</h2>
          {categoryRevenue.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Sin datos.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {categoryRevenue.map((_, index) => {
                      const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b']
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatPrice(Number(value))}
                    contentStyle={{
                      fontSize: 13,
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      color: '#111827',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {categoryRevenue.map((item, index) => {
               const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b']
               return (
                 <li key={item.category} className="flex items-center gap-2 text-sm text-ink/60">
                   <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                   <span className="truncate">{item.category}</span>
                   <span className="ml-auto font-medium text-ink">{formatPrice(item.revenue)}</span>
                 </li>
               )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-surface p-5 shadow-sm overflow-hidden flex flex-col justify-center">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40">{label}</p>
      <p 
        className="mt-1.5 text-lg lg:text-xl font-semibold tracking-tight text-ink whitespace-nowrap overflow-hidden"
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  )
}
