import { useMemo } from 'react'
import { getAllOrders, FLAT_SHIPPING } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function AdminOrdersPage() {
  useDocumentTitle('Admin — Pedidos')

  const orders = useMemo(
    () => [...getAllOrders()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [],
  )

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Pedidos</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((order) => (
              <tr key={order.orderNumber}>
                <td className="px-4 py-3 font-medium text-ink">{order.orderNumber}</td>
                <td className="px-4 py-3 text-ink/60">
                  {new Date(order.createdAt).toLocaleString('es-AR')}
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {currency.format(order.subtotal + FLAT_SHIPPING)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
