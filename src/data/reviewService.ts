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

export interface NewReviewInput {
  author: string
  rating: number
  title: string
  body: string
}

export function submitReview(productId: string, input: NewReviewInput): Promise<{ message: string }> {
  return apiFetch(`/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
