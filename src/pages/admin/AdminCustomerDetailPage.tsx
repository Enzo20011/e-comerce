import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Receipt, Users, Printer } from 'lucide-react'
import { getAllOrders, getOrderTotal } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { EmptyState } from '../../components/common/EmptyState'
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge'
import type { Order } from '../../types/order'



export function AdminCustomerDetailPage() {
  const { formatPrice } = useCurrency()
  const { email } = useParams<{ email: string }>()
  const decodedEmail = decodeURIComponent(email ?? '').toLowerCase()
  useDocumentTitle('Admin — Cliente')

  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    getAllOrders().then(setOrders)
  }, [])

  const customerOrders = useMemo(() => {
    if (!orders) return []
    return orders
      .filter((order) => order.shipping.email.trim().toLowerCase() === decodedEmail)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [orders, decodedEmail])

  const totalSpent = customerOrders.reduce(
    (sum, order) => sum + getOrderTotal(order.subtotal, order.discountAmount),
    0,
  )
  const name = customerOrders[0]?.shipping.name ?? decodedEmail
  const address = customerOrders[0]?.shipping

  return (
    <div>
      <Link
        to="/admin/customers"
        className="flex items-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-accent"
      >
        <ArrowLeft size={15} /> Volver a clientes
      </Link>

      {orders === null ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-ink/5" />
      ) : customerOrders.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No encontramos pedidos para este cliente." />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-surface/50 p-6">
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-ink/5 text-ink/50">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-semibold text-ink">{name}</h1>
              <p className="flex items-center gap-1.5 text-sm text-ink/60">
                <Mail size={13} /> {decodedEmail}
              </p>
              {address && (
                <p className="mt-1 text-sm text-ink/50">
                  {address.address}, {address.city} ({address.postalCode})
                </p>
              )}
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Pedidos</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink">{customerOrders.length}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Total gastado</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink">
                  {formatPrice(totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <h2 className="mt-8 flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Receipt size={17} /> Historial de pedidos
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {customerOrders.map((order) => (
              <div key={order.orderNumber} className="rounded-2xl border border-ink/10 bg-surface/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{order.orderNumber}</p>
                    <p className="text-xs text-ink/50">
                      {new Date(order.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <OrderStatusBadge status={order.status} />
                    <Link
                      to={`/admin/orders/${order.orderNumber}/print`}
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-md bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink hover:bg-ink/10 transition-colors"
                    >
                      <Printer size={12} /> Imprimir remito
                    </Link>
                  </div>
                </div>

                <div className="mt-3 divide-y divide-ink/10 border-t border-ink/10 pt-3">
                  {order.items.map((item, index) => (
                    <div key={`${item.product.id}-${index}`} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-ink/70">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-ink">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-sm font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatPrice(getOrderTotal(order.subtotal, order.discountAmount))}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
