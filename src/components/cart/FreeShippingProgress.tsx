import { Check, Truck } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'
import { FREE_SHIPPING_THRESHOLD } from '../../data/orderStore'



export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const { formatPrice } = useCurrency()
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const percent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const unlocked = remaining === 0

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink/70">
        {unlocked ? (
          <>
            <Check size={14} className="text-accent" />
            ¡Envío gratis desbloqueado!
          </>
        ) : (
          <>
            <Truck size={14} className="text-ink/40" />
            Te faltan <span className="text-ink">{formatPrice(remaining)}</span> para envío gratis
          </>
        )}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
