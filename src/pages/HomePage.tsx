import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, X } from 'lucide-react'
import { deriveCategories, getAllProducts } from '../data/productService'
import { getRecentlyViewedIds } from '../data/recentlyViewed'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ALL_CATEGORIES, SORT_OPTIONS, useProductFilters } from '../hooks/useProductFilters'
import { CategoryFilter } from '../components/catalog/CategoryFilter'
import { ProductCard } from '../components/catalog/ProductCard'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton'
import { SearchBar } from '../components/catalog/SearchBar'
import { SortSelect } from '../components/catalog/SortSelect'
import type { Product } from '../types/product'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function HomePage() {
  useDocumentTitle()

  const [allProducts, setAllProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    getAllProducts().then(setAllProducts)
  }, [])

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredProducts,
    visibleProducts,
    hasMore,
    loadMore,
  } = useProductFilters(allProducts ?? [])

  const categories = allProducts ? deriveCategories(allProducts) : []
  const heroProduct = allProducts?.find((product) => product.featured) ?? allProducts?.[0]

  const searchSuggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term || !allProducts) return []
    return allProducts.filter((product) => product.name.toLowerCase().includes(term)).slice(0, 5)
  }, [allProducts, searchTerm])

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== ALL_CATEGORIES || sortBy !== 'featured'

  const recentlyViewed = useMemo(() => {
    if (!allProducts) return []
    const byId = new Map(allProducts.map((product) => [product.id, product]))
    return getRecentlyViewedIds()
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product))
      .slice(0, 6)
  }, [allProducts])

  function clearAllFilters() {
    setSearchTerm('')
    setSelectedCategory(ALL_CATEGORIES)
    setSortBy('featured')
  }

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pt-16">
        <div className="grid gap-10 sm:grid-cols-12 sm:gap-6">
          <div className="animate-rise-in sm:col-span-7">
            <span className="inline-block rounded-full bg-accent-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-accent-2">
              Catálogo 2026
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-tight text-ink">
              Objetos con <span className="italic text-accent">carácter</span>.
            </h1>
            <p className="mt-6 max-w-sm text-ink/60">
              Catálogo con búsqueda instantánea, filtros por categoría y carrito dinámico. Cada
              pieza, elegida con intención.
            </p>
            <a
              href="#catalogo"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent"
            >
              Ver el catálogo <ArrowDown size={16} />
            </a>
          </div>

          {heroProduct && (
            <div
              style={{ animationDelay: '150ms' }}
              className="animate-rise-in relative sm:col-span-5"
            >
              <div className="relative -rotate-1 overflow-hidden rounded-3xl border border-ink/10 shadow-xl shadow-ink/10 sm:-rotate-2">
                <img src={heroProduct.image} alt={heroProduct.name} className="aspect-square w-full object-cover" />
              </div>
              <div className="absolute bottom-3 left-3 max-w-[80%] rotate-1 rounded-2xl bg-ink px-4 py-3 text-paper shadow-lg sm:-bottom-5 sm:-left-5 sm:rotate-3">
                <p className="truncate text-xs text-paper/60">{heroProduct.name}</p>
                <p className="font-display text-lg font-semibold">{currency.format(heroProduct.price)}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="font-display text-lg font-semibold text-ink">Seguiste viendo</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((product, index) => (
              <div key={product.id} className="w-40 flex-none sm:w-48">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="catalogo" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xs lg:flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} suggestions={searchSuggestions} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {searchTerm.trim() && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Búsqueda: "{searchTerm}" <X size={12} />
              </button>
            )}
            {selectedCategory !== ALL_CATEGORIES && (
              <button
                type="button"
                onClick={() => setSelectedCategory(ALL_CATEGORIES)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {selectedCategory} <X size={12} />
              </button>
            )}
            {sortBy !== 'featured' && (
              <button
                type="button"
                onClick={() => setSortBy('featured')}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {SORT_OPTIONS.find((option) => option.value === sortBy)?.label} <X size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-ink/40 underline-offset-2 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {allProducts === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <ProductGrid products={visibleProducts} />

            {filteredProducts.length > 0 && (
              <p className="mt-6 text-center text-xs text-ink/40">
                Mostrando {visibleProducts.length} de {filteredProducts.length} productos
              </p>
            )}

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-medium text-ink transition-all duration-150 hover:border-accent hover:text-accent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
