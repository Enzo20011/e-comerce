import { CATEGORIES, products as seedProducts } from './products'
import type { Product } from '../types/product'

const STORAGE_KEY = 'ecomerce.admin.products'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readStore(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Product[]
  } catch {
    // datos corruptos: se vuelve a sembrar abajo
  }

  const seeded = JSON.parse(JSON.stringify(seedProducts)) as Product[]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  } catch {
    // almacenamiento no disponible
  }
  return seeded
}

function writeStore(items: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // almacenamiento no disponible
  }
}

export function getAllProducts(): Product[] {
  return readStore()
}

export function getProductById(id: string): Product | undefined {
  return readStore().find((product) => product.id === id)
}

export function getCategories(): string[] {
  const live = new Set(readStore().map((product) => product.category))
  CATEGORIES.forEach((category) => live.add(category))
  return Array.from(live)
}

export function getFeaturedProducts(): Product[] {
  return readStore().filter((product) => product.featured)
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const all = readStore()
  const current = all.find((product) => product.id === productId)
  if (!current) return []
  return all
    .filter((product) => product.id !== productId && product.category === current.category)
    .slice(0, limit)
}

export function createProduct(data: Omit<Product, 'id'>): Product {
  const items = readStore()
  const baseSlug = slugify(data.name) || 'producto'
  let id = baseSlug
  let suffix = 2
  while (items.some((item) => item.id === id)) {
    id = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const created: Product = { ...data, id }
  writeStore([...items, created])
  return created
}

export function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Product | undefined {
  const items = readStore()
  let updated: Product | undefined
  const next = items.map((item) => {
    if (item.id !== id) return item
    updated = { ...item, ...data }
    return updated
  })
  if (updated) writeStore(next)
  return updated
}

export function deleteProduct(id: string): void {
  writeStore(readStore().filter((item) => item.id !== id))
}
