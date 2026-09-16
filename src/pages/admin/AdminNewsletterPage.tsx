import { useEffect, useMemo, useState } from 'react'
import { Download, Mail, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSubscriber, getSubscribers, type Subscriber } from '../../data/newsletterService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/TableSkeleton'

function csvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadSubscribersCsv(subscribers: Subscriber[]): void {
  const header = ['Email', 'Suscripto el'].join(',')
  const rows = subscribers.map((subscriber) =>
    [subscriber.email, new Date(subscriber.subscribedAt).toLocaleDateString('es-AR')]
      .map(csvValue)
      .join(','),
  )

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminNewsletterPage() {
  useDocumentTitle('Admin — Newsletter')

  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null)
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Subscriber | null>(null)

  useEffect(() => {
    getSubscribers().then(setSubscribers)
  }, [])

  const filtered = useMemo(() => {
    if (!subscribers) return []
    const term = search.trim().toLowerCase()
    return term ? subscribers.filter((subscriber) => subscriber.email.includes(term)) : subscribers
  }, [subscribers, search])

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await deleteSubscriber(pendingDelete.email)
      setSubscribers((current) => current?.filter((item) => item.email !== pendingDelete.email) ?? null)
      toast.success('Suscriptor eliminado')
    } catch {
      toast.error('No pudimos eliminar el suscriptor.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Newsletter</h1>
        <button
          type="button"
          onClick={() => downloadSubscribersCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>
      <p className="mt-1 text-sm text-ink/50">
        Emails suscriptos desde el formulario del pie de página.
      </p>

      <div className="relative mt-6 sm:max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por email..."
          className="w-full rounded-full border border-ink/15 bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {subscribers === null ? (
        <TableSkeleton rows={8} columns={2} />
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="Todavía no hay suscriptores." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
          <div className="divide-y divide-ink/10">
            {filtered.map((subscriber) => (
              <div key={subscriber.email} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink/5 text-ink/50">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{subscriber.email}</p>
                  <p className="text-xs text-ink/50">
                    Suscripto el {new Date(subscriber.subscribedAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(subscriber)}
                  aria-label={`Eliminar ${subscriber.email}`}
                  className="flex-none rounded-full text-ink/40 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`¿Eliminar "${pendingDelete.email}"?`}
          description="Se va a quitar de la lista de suscriptores."
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
