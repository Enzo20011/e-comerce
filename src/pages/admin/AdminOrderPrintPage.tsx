import { useEffect, useState } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { getAllOrders, getOrderTotal, getShippingCost } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ORDER_STATUS_LABELS } from '../../types/order'
import type { Order } from '../../types/order'



export function AdminOrderPrintPage() {
  const { formatPrice } = useCurrency()
  const { id } = useParams<{ id: string }>()
  useDocumentTitle(`Remito - ${id}`)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllOrders()
      .then((orders) => {
        const found = orders.find((o) => o.orderNumber === id)
        setOrder(found ?? null)
        setLoading(false)
        if (found) {
          // Auto-print after rendering
          setTimeout(() => window.print(), 500)
        }
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="p-12 text-center text-ink/50">Cargando recibo...</div>
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-xl font-bold text-ink">Pedido no encontrado</h1>
        <p className="mt-2 text-ink/60">El pedido {id} no existe.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface print:bg-white text-ink print:text-black">
      {/* Controls: hidden during print */}
      <div className="no-print border-b border-ink/10 bg-paper/50 px-8 py-4 flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} /> Volver a pedidos
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Printer size={16} /> Imprimir remito
        </button>
      </div>

      {/* Invoice Content */}
      <div className="mx-auto max-w-3xl p-8 print:p-0">
        <div className="flex items-start justify-between border-b border-ink/20 print:border-black/20 pb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Tienda.</h1>
            <p className="mt-1 text-sm text-ink/60 print:text-black/60">Recibo / Remito de entrega</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Pedido {order.orderNumber}</h2>
            <p className="text-sm text-ink/60 print:text-black/60 mt-1">
              {new Date(order.createdAt).toLocaleDateString('es-AR')}
            </p>
            <span className="mt-2 inline-block rounded-md bg-ink/5 print:border print:border-black/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink/70 print:text-black/70">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/50 print:text-black/50 mb-3">
              Datos del Cliente
            </h3>
            <p className="font-semibold text-lg">{order.shipping.name}</p>
            <p className="text-ink/80 print:text-black/80">{order.shipping.email}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/50 print:text-black/50 mb-3">
              Dirección de Envío
            </h3>
            <p className="text-ink/80 print:text-black/80">{order.shipping.address}</p>
            <p className="text-ink/80 print:text-black/80">
              {order.shipping.city}, CP {order.shipping.postalCode}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/50 print:text-black/50 mb-4 border-b border-ink/10 print:border-black/10 pb-2">
            Detalle de Productos
          </h3>
          <table className="w-full text-left text-sm">
            <thead className="text-ink/60 print:text-black/60">
              <tr>
                <th className="py-2 font-medium">Producto</th>
                <th className="py-2 font-medium text-center">Cant.</th>
                <th className="py-2 font-medium text-right">Precio Unit.</th>
                <th className="py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 print:divide-black/10">
              {order.items.map((item, index) => (
                <tr key={`${item.product.id}-${index}`}>
                  <td className="py-3 font-medium">{item.product.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{formatPrice(item.product.price)}</td>
                  <td className="py-3 text-right font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-64 space-y-3 text-sm">
            <div className="flex justify-between text-ink/70 print:text-black/70">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-ink/70 print:text-black/70">
                <span>Descuento ({order.discountCode})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/70 print:text-black/70 pb-3 border-b border-ink/10 print:border-black/10">
              <span>Envío</span>
              <span>
                {(() => {
                  const discounted = Math.max(0, order.subtotal - order.discountAmount)
                  const shipping = getShippingCost(discounted)
                  return shipping === 0 ? 'Gratis' : formatPrice(shipping)
                })()}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(getOrderTotal(order.subtotal, order.discountAmount))}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-ink/40 print:text-black/40">
          <p>Gracias por tu compra.</p>
          <p>Tienda. | soporte@tienda.com</p>
        </div>
      </div>
    </div>
  )
}
