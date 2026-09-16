import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Order } from '../../types/order'
import { getOrderTotal } from '../../data/orderStore'
import { OrderStatusTimeline } from '../common/OrderStatusTimeline'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function OrderConfirmation({ order }: { order: Order }) {
  const total = getOrderTotal(order.subtotal, order.discountAmount)

  return (
    <div className="mx-auto max-w-lg text-center">
      <CheckCircle2 size={48} className="mx-auto text-accent" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
        ¡Gracias por tu compra!
      </h1>
      <p className="mt-2 text-ink/60">
        Tu pedido <span className="font-semibold text-ink">{order.orderNumber}</span> fue confirmado.
      </p>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-surface/50 p-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-surface/50 p-6 text-left">
        <p className="text-sm font-medium text-ink">Datos de envío</p>
        <p className="mt-1 text-sm text-ink/60">{order.shipping.name}</p>
        <p className="text-sm text-ink/60">
          {order.shipping.address}, {order.shipping.city} ({order.shipping.postalCode})
        </p>
        <p className="text-sm text-ink/60">{order.shipping.email}</p>

        <div className="mt-4 divide-y divide-ink/10 border-t border-ink/10 pt-4">
          {order.items.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink/70">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-ink">
                {currency.format(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Descuento {order.discountCode && `(${order.discountCode})`}</span>
              <span>-{currency.format(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{currency.format(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Volver al catálogo
        </Link>
        <Link
          to="/pedido"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition-all duration-150 hover:border-accent hover:text-accent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Rastrear este pedido
        </Link>
      </div>
    </div>
  )
}
