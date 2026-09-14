import type { Review } from '../types/review'
import { AUTHOR_NAMES, REVIEW_BODIES, REVIEW_TITLES } from './reviewTemplates'
import { getProductById } from './productService'

const RELATIVE_DATES = [
  'hace 2 días',
  'hace 1 semana',
  'hace 2 semanas',
  'hace 1 mes',
  'hace 2 meses',
  'hace 3 meses',
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length]
}

export function getReviewsForProduct(productId: string): Review[] {
  const baseRating = getProductById(productId)?.rating ?? 4.5
  const baseHash = hashString(productId)
  const count = 3 + (baseHash % 4)

  return Array.from({ length: count }, (_, index) => {
    const seed = baseHash + index * 97
    const jitter = ((seed % 5) - 2) * 0.25
    const rating = Math.min(5, Math.max(1, Math.round((baseRating + jitter) * 2) / 2))

    return {
      id: `${productId}-review-${index}`,
      productId,
      author: pick(AUTHOR_NAMES, seed),
      rating,
      date: pick(RELATIVE_DATES, seed + 13),
      title: pick(REVIEW_TITLES, seed + 29),
      body: pick(REVIEW_BODIES, seed + 47),
    }
  })
}
