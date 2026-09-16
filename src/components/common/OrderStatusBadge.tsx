import { ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order'

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendiente: 'bg-accent-2/20 text-accent-2',
  enviado: 'bg-accent/15 text-accent',
  entregado: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  cancelado: 'bg-ink/10 text-ink/50',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
