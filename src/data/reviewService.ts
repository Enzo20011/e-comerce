import { apiFetch } from '../lib/api'
import type { Review } from '../types/review'

export function getReviewsForProduct(productId: string): Promise<Review[]> {
  return apiFetch(`/products/${productId}/reviews`)
}

export interface AdminReview extends Review {
  productName: string
  hidden: boolean
}

export function getAllReviewsForAdmin(): Promise<AdminReview[]> {
  return apiFetch('/reviews', { auth: true })
}

export function hideReview(reviewId: string): Promise<void> {
  return apiFetch(`/reviews/${reviewId}/hide`, { method: 'PATCH', auth: true })
}

export function restoreReview(reviewId: string): Promise<void> {
  return apiFetch(`/reviews/${reviewId}/restore`, { method: 'PATCH', auth: true })
}
