import type { Review } from '../../types/review'
import { ReviewCard } from './ReviewCard'

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-ink/50">Todavía no hay reseñas para este producto.</p>
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
