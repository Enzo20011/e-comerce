import type { CartItem } from '../../types/cart'
import { FLAT_SHIPPING } from '../../data/orderStore'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function CheckoutSummary({ items, subtotal }: { items: CartItem[]; subtotal: number }) {
  const total = subtotal + FLAT_SHIPPING

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface/50 p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Tu pedido</h2>

      <div className="mt-4 divide-y divide-ink/10">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3 py-3">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="h-12 w-12 flex-none rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{item.product.name}</p>
              <p className="text-xs text-ink/50">Cantidad: {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-ink">
              {currency.format(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>Subtotal</span>
          <span>{currency.format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/60">
          <span>Envío</span>
          <span>{currency.format(FLAT_SHIPPING)}</span>
        </div>
        <div className="flex justify-between pt-1.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{currency.format(total)}</span>
        </div>
      </div>
    </div>
  )
}
