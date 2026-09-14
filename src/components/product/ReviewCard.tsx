import { Star } from 'lucide-react'
import type { Review } from '../../types/review'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-ink/10 py-5 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.round(review.rating) ? 'fill-accent text-accent' : 'text-ink/20'}
            />
          ))}
        </div>
        <span className="text-xs text-ink/40">{review.date}</span>
      </div>
      <p className="mt-2 font-display text-sm font-semibold text-ink">{review.title}</p>
      <p className="mt-1 text-sm text-ink/70">{review.body}</p>
      <p className="mt-2 text-xs font-medium text-ink/50">{review.author}</p>
    </div>
  )
}
