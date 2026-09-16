import { Fragment, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getAllOrders, getOrderTotal, updateOrderStatus } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { EmptyState } from '../../components/common/EmptyState'
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge'
import { TableSkeleton } from '../../components/common/TableSkeleton'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../../types/order'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

const STATUS_FILTERS: (OrderStatus | 'todos')[] = ['todos', ...ORDER_STATUSES]
const PAGE_SIZE = 15

function csvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadOrdersCsv(orders: Order[]): void {
  const header = ['Pedido', 'Cliente', 'Email', 'Fecha', 'Estado', 'Items', 'Total'].join(',')
  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.shipping.name,
      order.shipping.email,
      new Date(order.createdAt).toLocaleDateString('es-AR'),
      ORDER_STATUS_LABELS[order.status],
      String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
      currency.format(getOrderTotal(order.subtotal, order.discountAmount)),
    ]
      .map(csvValue)
      .join(','),
  )

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminOrdersPage() {
  useDocumentTitle('Admin — Pedidos')

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    getAllOrders().then(setOrders)
  }, [])

  const filtered = useMemo(() => {
    if (!orders) return []
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.shipping.name.toLowerCase().includes(term) ||
        order.shipping.email.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'todos' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleStatusChange(orderNumber: string, status: OrderStatus) {
    setOrders((current) =>
      current
        ? current.map((order) => (order.orderNumber === orderNumber ? { ...order, status } : order))
        : current,
    )
    try {
      await updateOrderStatus(orderNumber, status)
      toast.success(`Pedido ${orderNumber} marcado como "${ORDER_STATUS_LABELS[status]}"`)
    } catch {
      toast.error('No pudimos actualizar el estado del pedido.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Pedidos</h1>
        <button
          type="button"
          onClick={() => downloadOrdersCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por N° de pedido, cliente o email..."
            className="w-full rounded-full border border-ink/15 bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-1 rounded-full border border-ink/10 p-1">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                statusFilter === status ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {status === 'todos' ? 'Todos' : ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {orders === null ? (
        <TableSkeleton rows={8} columns={7} />
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No encontramos pedidos con esos filtros." />
        </div>
      ) : (
        <>
        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium" />
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {paginated.map((order) => {
                const isOpen = expanded === order.orderNumber
                return (
                  <Fragment key={order.orderNumber}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
                      className="cursor-pointer hover:bg-ink/[0.02]"
                    >
                      <td className="px-4 py-3 text-ink/40">
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-ink/60">{order.shipping.name}</td>
                      <td className="px-4 py-3 text-ink/60">
                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {currency.format(getOrderTotal(order.subtotal, order.discountAmount))}
                      </td>
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            handleStatusChange(order.orderNumber, event.target.value as OrderStatus)
                          }
                          className="rounded-full border border-ink/15 bg-surface/60 px-3 py-1.5 text-xs font-medium text-ink outline-none focus:border-accent"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {ORDER_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-ink/[0.02]">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
                                Envío
                              </p>
                              <p className="mt-2 text-sm text-ink/70">{order.shipping.email}</p>
                              <p className="text-sm text-ink/70">
                                {order.shipping.address}, {order.shipping.city} (
                                {order.shipping.postalCode})
                              </p>
                              <div className="mt-2">
                                <OrderStatusBadge status={order.status} />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
                                Productos
                              </p>
                              <div className="mt-2 divide-y divide-ink/10">
                                {order.items.map((item, index) => (
                                  <div
                                    key={`${item.product.id}-${index}`}
                                    className="flex items-center justify-between py-1.5 text-sm"
                                  >
                                    <span className="text-ink/70">
                                      {item.product.name} × {item.quantity}
                                    </span>
                                    <span className="font-medium text-ink">
                                      {currency.format(item.product.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

          <div className="mt-6 flex flex-col gap-3 sm:hidden">
            {paginated.map((order) => {
              const isOpen = expanded === order.orderNumber
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              return (
                <div key={order.orderNumber} className="rounded-2xl border border-ink/10 bg-surface/50 p-4">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg text-left transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{order.orderNumber}</p>
                      <p className="truncate text-xs text-ink/50">
                        {order.shipping.name} · {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`flex-none text-ink/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                    <span className="text-ink/60">{itemCount} items</span>
                    <span className="font-semibold text-ink">
                      {currency.format(getOrderTotal(order.subtotal, order.discountAmount))}
                    </span>
                  </div>

                  <div className="mt-3">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        handleStatusChange(order.orderNumber, event.target.value as OrderStatus)
                      }
                      className="w-full rounded-full border border-ink/15 bg-surface/60 px-3 py-2 text-xs font-medium text-ink outline-none focus:border-accent"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isOpen && (
                    <div className="mt-3 border-t border-ink/10 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Envío</p>
                      <p className="mt-1 text-sm text-ink/70">{order.shipping.email}</p>
                      <p className="text-sm text-ink/70">
                        {order.shipping.address}, {order.shipping.city} ({order.shipping.postalCode})
                      </p>

                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink/50">
                        Productos
                      </p>
                      <div className="mt-1 divide-y divide-ink/10">
                        {order.items.map((item, index) => (
                          <div key={`${item.product.id}-${index}`} className="flex items-center justify-between py-1.5 text-sm">
                            <span className="text-ink/70">
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-medium text-ink">
                              {currency.format(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink/50">
          <span>
            Página {page} de {pageCount} · {filtered.length} pedidos
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 transition-all duration-150 hover:border-accent hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount}
              aria-label="Página siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 transition-all duration-150 hover:border-accent hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
