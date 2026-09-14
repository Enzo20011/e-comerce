import { useMemo, useState } from 'react'
import type { Product } from '../types/product'

export const ALL_CATEGORIES = 'Todas'

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc'

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc', label: 'Nombre: A-Z' },
]

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products]
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
  }
}

export function useProductFilters(allProducts: Product[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES)
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const filteredProducts = useMemo(() => {
    const byCategory =
      selectedCategory === ALL_CATEGORIES
        ? allProducts
        : allProducts.filter((product) => product.category === selectedCategory)

    const term = searchTerm.trim().toLowerCase()
    const bySearch = term
      ? byCategory.filter(
          (product) =>
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term),
        )
      : byCategory

    return sortProducts(bySearch, sortBy)
  }, [allProducts, searchTerm, selectedCategory, sortBy])

  const isDefaultView = searchTerm.trim() === '' && selectedCategory === ALL_CATEGORIES && sortBy === 'featured'

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredProducts,
    isDefaultView,
  }
}
