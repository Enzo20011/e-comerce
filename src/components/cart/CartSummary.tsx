import { FreeShippingProgress } from './FreeShippingProgress'
import { useCurrency } from '../../context/CurrencyContext'

interface CartSummaryProps {
  subtotal: number
  onClear: () => void
  onCheckout: () => void
  onClose?: () => void
}

export function CartSummary({ subtotal, onClear, onCheckout, onClose }: CartSummaryProps) {
  const { formatPrice } = useCurrency()
  return (
    <div className="border-t border-ink/10 p-6">
      <div className="mb-4">
        <FreeShippingProgress subtotal={subtotal} />
      </div>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-ink/60">Subtotal</span>
        <span className="text-lg font-semibold text-ink">{formatPrice(subtotal)}</span>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        className="w-full rounded-full bg-ink py-3 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        Finalizar compra
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-full py-2.5 text-sm font-medium text-ink transition-all duration-150 hover:bg-ink/5 hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Seguir comprando
      </button>
      <button
        type="button"
        onClick={onClear}
        className="mt-2 w-full rounded-full py-2 text-xs text-ink/40 transition-all duration-150 hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Vaciar carrito
      </button>
    </div>
  )
}
