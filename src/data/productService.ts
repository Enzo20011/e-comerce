import { apiFetch, ApiError } from '../lib/api'
import { CATEGORIES } from './products'
import type { Product } from '../types/product'

export const LOW_STOCK_THRESHOLD = 5

export function deriveCategories(products: Product[]): string[] {
  const categories = new Set(products.map((product) => product.category))
  CATEGORIES.forEach((category) => categories.add(category))
  return Array.from(categories)
}

export interface ProductDetail extends Product {
  recentViews: number
}

export function getAllProducts(): Promise<Product[]> {
  return apiFetch('/products')
}

export async function getProductById(id: string): Promise<ProductDetail | undefined> {
  try {
    return await apiFetch<ProductDetail>(`/products/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  return apiFetch(`/products/${productId}/related?limit=${limit}`)
}

export function getFrequentlyBoughtWith(productId: string, limit = 4): Promise<Product[]> {
  return apiFetch(`/products/${productId}/frequently-bought-with?limit=${limit}`)
}

export function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD): Promise<Product[]> {
  return apiFetch(`/products/low-stock?threshold=${threshold}`, { auth: true })
}

export function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  return apiFetch('/products', { method: 'POST', auth: true, body: JSON.stringify(data) })
}

export function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<Product> {
  return apiFetch(`/products/${id}`, { method: 'PUT', auth: true, body: JSON.stringify(data) })
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch(`/products/${id}`, { method: 'DELETE', auth: true })
}
