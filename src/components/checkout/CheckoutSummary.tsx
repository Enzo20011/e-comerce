import { useState } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { Check, Lock, RotateCcw, ShieldCheck, Tag, X } from 'lucide-react'
import type { CartItem } from '../../types/cart'
import type { CouponValidationResult } from '../../types/order'
import { getOrderTotal, getShippingCost, validateCoupon } from '../../data/orderStore'
import { FreeShippingProgress } from '../cart/FreeShippingProgress'



import { useCart } from '../../hooks/useCart'

interface CheckoutSummaryProps {
  items: CartItem[]
  subtotal: number
  appliedCoupon: { code: string; result: CouponValidationResult } | null
  onCouponApplied: (code: string, result: CouponValidationResult) => void
  onCouponRemoved: () => void
}

export function CheckoutSummary({
  items,
  subtotal,
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
}: CheckoutSummaryProps) {
  const { removeItem } = useCart()
  const { formatPrice } = useCurrency()
  const [couponInput, setCouponInput] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const discountAmount = appliedCoupon?.result.valid ? appliedCoupon.result.discountAmount : 0
  const shipping = getShippingCost(Math.max(0, subtotal - discountAmount))
  const total = getOrderTotal(subtotal, discountAmount)

  async function handleApplyCoupon() {
    const code = couponInput.trim()
    if (!code) return
    setChecking(true)
    setError(null)
    const result = await validateCoupon(code, subtotal)
    setChecking(false)
    if (!result.valid) {
      setError(result.message)
      return
    }
    onCouponApplied(code, result)
    setCouponInput('')
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface/50 p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Tu pedido</h2>

      <div className="mt-4">
        <FreeShippingProgress subtotal={Math.max(0, subtotal - discountAmount)} />
      </div>

      <div className="mt-4 divide-y divide-ink/10 border-t border-ink/10 pt-2">
        {items.map((item) => (
          <div key={item.product.id} className="group flex items-center gap-3 py-3 relative">
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
              {formatPrice(item.product.price * item.quantity)}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                removeItem(item.product.id)
              }}
              title="Eliminar producto"
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/5 text-accent/60 opacity-0 transition-all hover:bg-accent/10 hover:text-accent group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10 pt-4">
        {appliedCoupon?.result.valid ? (
          <div className="flex items-center justify-between rounded-xl bg-accent/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-accent">
              <Check size={14} /> {appliedCoupon.code}
            </span>
            <button
              type="button"
              onClick={onCouponRemoved}
              aria-label="Quitar cupón"
              className="text-accent/70 transition-colors hover:text-accent"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="Código de descuento"
                  className="w-full rounded-xl border border-ink/15 bg-surface/60 py-2 pl-8 pr-3 text-xs uppercase text-ink outline-none focus:border-accent"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={checking || !couponInput.trim()}
                className="flex-none rounded-xl border border-ink/15 px-3 py-2 text-xs font-medium text-ink transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checking ? '...' : 'Aplicar'}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-accent">
            <span>Descuento</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink/60">
          <span>Envío</span>
          <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between pt-1.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4 text-xs text-ink/50">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-accent" />
          Pago 100% seguro con cifrado SSL
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-accent" />
          Tus datos nunca se comparten con terceros
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={13} className="text-accent" />
          30 días para cambios y devoluciones
        </div>
      </div>
    </div>
  )
}
