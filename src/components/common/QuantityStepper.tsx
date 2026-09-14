import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  quantity: number
  max: number
  onChange: (quantity: number) => void
}

export function QuantityStepper({ quantity, max, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-ink/10 px-2 py-1">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label="Restar cantidad"
        className="flex h-6 w-6 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-accent disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-4 text-center text-sm font-medium text-ink">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        aria-label="Sumar cantidad"
        className="flex h-6 w-6 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-accent disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
