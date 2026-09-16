import { Check, Clock, Package, XCircle } from 'lucide-react'
import type { OrderStatus } from '../../types/order'

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pendiente', label: 'Pendiente', icon: Clock },
  { status: 'enviado', label: 'Enviado', icon: Package },
  { status: 'entregado', label: 'Entregado', icon: Check },
]

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelado') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-accent/10 px-4 py-3 text-accent">
        <XCircle size={20} className="flex-none" />
        <p className="text-sm font-medium">Este pedido fue cancelado.</p>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status)

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isReached = index <= currentIndex
        const Icon = step.icon

        return (
          <div key={step.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  isReached
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-ink/15 bg-surface text-ink/30'
                } ${isCurrent ? 'ring-4 ring-accent/15' : ''}`}
              >
                {isDone ? <Check size={16} /> : <Icon size={15} />}
              </div>
              <span
                className={`text-xs font-medium ${isReached ? 'text-ink' : 'text-ink/40'}`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                  index < currentIndex ? 'bg-accent' : 'bg-ink/10'
                }`}
                style={{ marginBottom: '1.25rem' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
