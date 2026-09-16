import { TriangleAlert } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div onClick={onCancel} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      <div className="animate-rise-in relative w-full max-w-sm rounded-2xl border border-ink/10 bg-surface p-6 shadow-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <TriangleAlert size={20} />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink/60">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink/60 transition-all duration-150 hover:text-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent shadow-sm shadow-accent/20 transition-all duration-150 hover:bg-accent-vivid hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
