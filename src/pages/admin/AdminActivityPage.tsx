import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { getActivity, type ActivityEntry } from '../../data/activityService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { EmptyState } from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/TableSkeleton'

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Recién'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days} d`
  return new Date(iso).toLocaleDateString('es-AR')
}

export function AdminActivityPage() {
  useDocumentTitle('Admin — Actividad')

  const [entries, setEntries] = useState<ActivityEntry[] | null>(null)

  useEffect(() => {
    getActivity(100).then(setEntries)
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Actividad</h1>
      <p className="mt-1 text-sm text-ink/50">Registro de cambios recientes hechos desde el panel.</p>

      {entries === null ? (
        <div className="mt-6">
          <TableSkeleton rows={8} columns={1} />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="Todavía no hay actividad registrada." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
          <div className="divide-y divide-ink/10">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink/5 text-ink/50">
                  <History size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{entry.action}</p>
                  <p className="text-xs text-ink/45">{formatRelative(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
