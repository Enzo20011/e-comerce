import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getAllOrders } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  getSummaryStats,
  groupRevenueByDay,
  groupRevenueByMonth,
  groupRevenueByYear,
} from '../../utils/analytics'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

type Period = 'day' | 'month' | 'year'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

export function AdminDashboardPage() {
  useDocumentTitle('Admin — Dashboard')

  const orders = useMemo(() => getAllOrders(), [])
  const stats = useMemo(() => getSummaryStats(orders), [orders])
  const [period, setPeriod] = useState<Period>('day')

  const chartData = useMemo(() => {
    if (period === 'day') return groupRevenueByDay(orders, 30)
    if (period === 'month') return groupRevenueByMonth(orders, 12)
    return groupRevenueByYear(orders)
  }, [orders, period])

  const today = new Date().toISOString().slice(0, 10)
  const ordersToday = orders.filter((order) => order.createdAt.startsWith(today)).length

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Ingresos totales" value={currency.format(stats.totalRevenue)} />
        <StatTile label="Pedidos totales" value={String(stats.totalOrders)} />
        <StatTile label="Ticket promedio" value={currency.format(stats.averageOrderValue)} />
        <StatTile label="Pedidos hoy" value={String(ordersToday)} />
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-surface/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Ingresos</h2>
          <div className="flex gap-1 rounded-full border border-ink/10 p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-surface/50 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}
