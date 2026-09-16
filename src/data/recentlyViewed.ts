const STORAGE_KEY = 'ecomerce.recentlyViewed'
const MAX_ITEMS = 10

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // almacenamiento no disponible
  }
}

export function trackProductView(productId: string): void {
  const ids = readIds().filter((id) => id !== productId)
  ids.unshift(productId)
  writeIds(ids.slice(0, MAX_ITEMS))
}

export function getRecentlyViewedIds(excludeId?: string): string[] {
  const ids = readIds()
  return excludeId ? ids.filter((id) => id !== excludeId) : ids
}
