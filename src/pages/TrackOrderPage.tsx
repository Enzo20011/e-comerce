import { useState, type FormEvent } from 'react'
import { PackageSearch, SearchX } from 'lucide-react'
import { findOrder, getOrderTotal } from '../data/orderStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { OrderStatusTimeline } from '../components/common/OrderStatusTimeline'
import type { Order } from '../types/order'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function TrackOrderPage() {
  useDocumentTitle('Rastrear pedido')

  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<Order | null | undefined>(undefined)
  const [searching, setSearching] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSearching(true)
    const order = await findOrder(orderNumber, email)
    setResult(order ?? null)
    setSearching(false)
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-14">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Rastrear pedido</h1>
      <p className="mt-2 text-ink/60">
        Ingresá tu número de pedido y el email usado en la compra para ver su estado.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="orderNumber" className="mb-1 block text-sm font-medium text-ink/70">
            Número de pedido
          </label>
          <input
            id="orderNumber"
            required
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="ORD-XXXXXX"
            className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink/70">
            Email de la compra
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {searching ? 'Buscando…' : 'Buscar pedido'}
        </button>
      </form>

      {result === null && (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/15 py-12 text-center">
          <SearchX size={28} className="text-ink/30" />
          <p className="text-sm text-ink/60">
            No encontramos ningún pedido con esos datos. Revisá el número y el email.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-10 rounded-2xl border border-ink/10 bg-surface/50 p-6">
          <div className="flex items-center gap-2">
            <PackageSearch size={18} className="text-ink/50" />
            <p className="font-semibold text-ink">{result.orderNumber}</p>
          </div>

          <p className="mt-2 text-xs text-ink/50">
            Realizado el {new Date(result.createdAt).toLocaleString('es-AR')}
          </p>

          <div className="mt-6">
            <OrderStatusTimeline status={result.status} />
          </div>

          <div className="mt-6 divide-y divide-ink/10 border-t border-ink/10 pt-4">
            {result.items.map((item, index) => (
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
            {result.discountAmount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Descuento {result.discountCode && `(${result.discountCode})`}</span>
                <span>-{currency.format(result.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{currency.format(getOrderTotal(result.subtotal, result.discountAmount))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
