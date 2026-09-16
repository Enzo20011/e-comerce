import { Trash2 } from 'lucide-react'
import type { CartItem } from '../../types/cart'
import { QuantityStepper } from '../common/QuantityStepper'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { product, quantity } = item

  return (
    <div className="flex gap-3 py-4">
      <img
        src={product.image}
        alt={product.name}
        className="h-20 w-20 flex-none rounded-xl object-cover"
      />

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink">{product.name}</p>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${product.name} del carrito`}
            className="text-ink/40 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <p className="text-sm text-ink/60">{currency.format(product.price)}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper quantity={quantity} max={product.stock} onChange={onUpdateQuantity} />
          <span className="text-sm font-semibold text-ink">
            {currency.format(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
