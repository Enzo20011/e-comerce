import { useEffect, useMemo, useState } from 'react'
import { EyeOff, Eye, Search, Star } from 'lucide-react'
import { toast } from 'sonner'
import { getAllReviewsForAdmin, hideReview, restoreReview, type AdminReview } from '../../data/reviewService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { EmptyState } from '../../components/common/EmptyState'
import { Skeleton } from '../../components/common/Skeleton'

type VisibilityFilter = 'todas' | 'visibles' | 'ocultas'

export function AdminReviewsPage() {
  useDocumentTitle('Admin — Reseñas')

  const [reviews, setReviews] = useState<AdminReview[] | null>(null)
  const [search, setSearch] = useState('')
  const [visibility, setVisibility] = useState<VisibilityFilter>('todas')

  useEffect(() => {
    getAllReviewsForAdmin().then(setReviews)
  }, [])

  const filtered = useMemo(() => {
    if (!reviews) return []
    const term = search.trim().toLowerCase()
    return reviews.filter((review) => {
      const matchesSearch =
        !term ||
        review.productName.toLowerCase().includes(term) ||
        review.author.toLowerCase().includes(term) ||
        review.title.toLowerCase().includes(term)
      const matchesVisibility =
        visibility === 'todas' ||
        (visibility === 'visibles' && !review.hidden) ||
        (visibility === 'ocultas' && review.hidden)
      return matchesSearch && matchesVisibility
    })
  }, [reviews, search, visibility])

  async function handleToggle(review: AdminReview) {
    setReviews((current) =>
      current
        ? current.map((item) => (item.id === review.id ? { ...item, hidden: !item.hidden } : item))
        : current,
    )
    try {
      if (review.hidden) {
        await restoreReview(review.id)
        toast.success('Reseña restaurada')
      } else {
        await hideReview(review.id)
        toast.success('Reseña ocultada')
      }
    } catch {
      toast.error('No pudimos actualizar la reseña.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Reseñas</h1>
      <p className="mt-1 text-sm text-ink/50">
        Moderá las reseñas de los productos: ocultá las que no quieras mostrar en la tienda.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, autor o título..."
            className="w-full rounded-full border border-ink/15 bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-1 rounded-full border border-ink/10 p-1">
          {(['todas', 'visibles', 'ocultas'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVisibility(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                visibility === option ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {reviews === null ? (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-ink/10 p-5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-3 h-4 w-1/2" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No encontramos reseñas con esos filtros." />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`rounded-2xl border p-5 transition-opacity ${
                review.hidden ? 'border-ink/10 bg-ink/[0.02] opacity-60' : 'border-ink/10 bg-surface/50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    {review.productName}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-ink">{review.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < Math.round(review.rating) ? 'fill-accent text-accent' : 'text-ink/20'}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(review)}
                    aria-label={review.hidden ? 'Restaurar reseña' : 'Ocultar reseña'}
                    className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {review.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    {review.hidden ? 'Restaurar' : 'Ocultar'}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink/70">{review.body}</p>
              <p className="mt-2 text-xs font-medium text-ink/50">
                {review.author} · {review.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
