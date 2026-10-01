import { Fragment, useEffect, useState } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { Link } from 'react-router-dom'
import { ChevronDown, Download, Search, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { exportOrders, getOrderTotal, getOrdersPage, updateOrderStatus } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { EmptyState } from '../../components/common/EmptyState'
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge'
import { TableSkeleton } from '../../components/common/TableSkeleton'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../../types/order'



const STATUS_FILTERS: (OrderStatus | 'todos')[] = ['todos', ...ORDER_STATUSES]
const PAGE_SIZE = 15

function csvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadOrdersCsv(orders: Order[], formatPrice: (n: number) => string): void {
  const header = ['Pedido', 'Cliente', 'Email', 'Fecha', 'Estado', 'Items', 'Total'].join(',')
  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.shipping.name,
      order.shipping.email,
      new Date(order.createdAt).toLocaleDateString('es-AR'),
      ORDER_STATUS_LABELS[order.status],
      String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
      formatPrice(getOrderTotal(order.subtotal, order.discountAmount)),
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
  const { formatPrice } = useCurrency()
  useDocumentTitle('Admin — Pedidos')

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    let active = true
    getOrdersPage({
      page,
      pageSize: PAGE_SIZE,
      status: statusFilter === 'todos' ? undefined : statusFilter,
      q: debouncedSearch || undefined,
    })
      .then((result) => {
        if (!active) return
        setOrders(result.items)
        setTotal(result.total)
      })
      .catch(() => active && toast.error('No pudimos cargar los pedidos.'))
    return () => {
      active = false
    }
  }, [page, statusFilter, debouncedSearch])

  const filtered = orders ?? []
  const paginated = filtered
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function handleExport() {
    try {
      const all = await exportOrders(statusFilter === 'todos' ? undefined : statusFilter, debouncedSearch || undefined)
      downloadOrdersCsv(all, formatPrice)
    } catch {
      toast.error('No pudimos exportar los pedidos.')
    }
  }

  async function handleStatusChange(orderNumber: string, status: OrderStatus) {
    setOrders((current) =>
      current
        ? current.map((order) => (order.orderNumber === orderNumber ? { ...order, status } : order))
        : current,
    )
    try {
      await updateOrderStatus(orderNumber, status)
      toast.success(`Pedido ${orderNumber} marcado como "${ORDER_STATUS_LABELS[status]}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos actualizar el estado del pedido.')
      getOrdersPage({ page, pageSize: PAGE_SIZE, status: statusFilter === 'todos' ? undefined : statusFilter, q: debouncedSearch || undefined })
        .then((result) => setOrders(result.items))
        .catch(() => undefined)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Pedidos</h1>
        <button
          type="button"
          onClick={handleExport}
          disabled={total === 0}
          className="flex items-center gap-2 rounded-md border border-ink/15 bg-surface px-3 py-1.5 text-sm font-medium text-ink/80 shadow-sm transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} className="text-ink/50" /> Exportar CSV
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-ink/10 bg-surface shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between bg-surface/50">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por N° de pedido, cliente..."
              className="w-full rounded-md border border-ink/15 bg-surface py-1.5 pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-wrap gap-1 rounded-md border border-ink/15 bg-surface p-1 shadow-sm">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  status === statusFilter 
                    ? 'bg-ink/10 text-ink shadow-sm' 
                    : 'text-ink/50 hover:text-ink hover:bg-ink/5'
                }`}
              >
                {status === 'todos' ? 'Todos' : ORDER_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {orders === null ? (
          <div className="p-4"><TableSkeleton rows={8} columns={7} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState message="No encontramos pedidos con esos filtros." />
          </div>
        ) : (
          <>
          {/* Tabla: sm y arriba */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-ink/10 bg-ink/5 text-xs font-semibold uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-6 py-3 w-8" />
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {paginated.map((order) => {
                  const isOpen = expanded === order.orderNumber
                  return (
                    <Fragment key={order.orderNumber}>
                      <tr
                        onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
                        className={`cursor-pointer transition-colors ${isOpen ? 'bg-surface/80' : 'hover:bg-ink/5'}`}
                      >
                        <td className="px-6 py-4 text-ink/40">
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-ink">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-ink/80">{order.shipping.name}</td>
                        <td className="px-6 py-4 text-ink/50">
                          {new Date(order.createdAt).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-ink/50">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-6 py-4 font-medium text-ink">
                          {formatPrice(getOrderTotal(order.subtotal, order.discountAmount))}
                        </td>
                        <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(event) =>
                              handleStatusChange(order.orderNumber, event.target.value as OrderStatus)
                            }
                            className="rounded-md border border-ink/15 bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent hover:bg-ink/5 cursor-pointer"
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status} className="bg-surface text-ink">
                                {ORDER_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-surface/80 border-b border-ink/10">
                          <td colSpan={7} className="px-6 py-6">
                            <div className="grid gap-8 sm:grid-cols-2">
                              <div className="rounded-lg bg-surface p-4 shadow-sm border border-ink/10">
                                <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                                  Datos de Envío
                                </p>
                                <div className="mt-3 text-sm text-ink/80 space-y-1">
                                  <p className="font-medium text-ink">{order.shipping.name}</p>
                                  <p>{order.shipping.email}</p>
                                  <p>{order.shipping.address}</p>
                                  <p>{order.shipping.city}, {order.shipping.postalCode}</p>
                                </div>
                                <div className="mt-4 border-t border-ink/5 pt-3 flex items-center justify-between">
                                  <OrderStatusBadge status={order.status} />
                                  <Link
                                    to={`/admin/orders/${order.orderNumber}/print`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/10 transition-colors"
                                  >
                                    <Printer size={14} /> Imprimir remito
                                  </Link>
                                </div>
                              </div>
                              <div className="rounded-lg bg-surface p-4 shadow-sm border border-ink/10">
                                <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                                  Productos
                                </p>
                                <div className="mt-3 divide-y divide-ink/5">
                                  {order.items.map((item, index) => (
                                    <div
                                      key={`${item.product.id}-${index}`}
                                      className="flex items-center justify-between py-2 text-sm"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded bg-ink/5 text-xs font-medium text-ink/60">
                                          {item.quantity}x
                                        </div>
                                        <span className="text-ink/80 font-medium">{item.product.name}</span>
                                      </div>
                                      <span className="font-semibold text-ink">
                                        {formatPrice(item.product.price * item.quantity)}
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

          {/* Tarjetas: debajo de sm */}
          <div className="flex flex-col divide-y divide-ink/10 sm:hidden">
            {paginated.map((order) => {
              const isOpen = expanded === order.orderNumber
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              return (
                <div key={order.orderNumber} className="p-4 bg-surface">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
                    className="flex w-full items-center justify-between gap-2 text-left transition-colors focus-visible:outline-none"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{order.orderNumber}</p>
                      <p className="truncate text-xs text-ink/50 mt-0.5">
                        {order.shipping.name} · {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`flex-none text-ink/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-3 text-sm">
                    <span className="text-ink/50 bg-ink/5 px-2 py-0.5 rounded-md text-xs">{itemCount} items</span>
                    <span className="font-semibold text-ink">
                      {formatPrice(getOrderTotal(order.subtotal, order.discountAmount))}
                    </span>
                  </div>

                  <div className="mt-3">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        handleStatusChange(order.orderNumber, event.target.value as OrderStatus)
                      }
                      className="w-full rounded-md border border-ink/15 bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-surface text-ink">
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isOpen && (
                    <div className="mt-4 rounded-lg bg-surface/50 p-4 border border-ink/5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Envío</p>
                      <div className="mt-2 text-sm text-ink/80 space-y-0.5">
                        <p className="font-medium text-ink">{order.shipping.email}</p>
                        <p>{order.shipping.address}</p>
                        <p>{order.shipping.city} ({order.shipping.postalCode})</p>
                      </div>

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                        Productos
                      </p>
                      <div className="mt-2 divide-y divide-ink/10">
                        {order.items.map((item, index) => (
                          <div key={`${item.product.id}-${index}`} className="flex items-center justify-between py-2 text-sm">
                            <span className="text-ink/80 font-medium">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-semibold text-ink">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end border-t border-ink/5 pt-3">
                        <Link
                          to={`/admin/orders/${order.orderNumber}/print`}
                          target="_blank"
                          className="flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/10 transition-colors"
                        >
                          <Printer size={14} /> Imprimir remito
                        </Link>
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
          <div className="flex items-center justify-between border-t border-ink/10 bg-ink/5 px-4 py-3 sm:px-6">
            <span className="text-sm text-ink/80">
              Página <span className="font-medium text-ink">{page}</span> de <span className="font-medium text-ink">{pageCount}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="relative inline-flex items-center rounded-md bg-surface px-3 py-2 text-sm font-semibold text-ink ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-ink/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
                aria-label="Página siguiente"
                className="relative inline-flex items-center rounded-md bg-surface px-3 py-2 text-sm font-semibold text-ink ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-ink/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
