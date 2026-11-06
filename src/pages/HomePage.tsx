import { useEffect, useMemo, useState, useRef } from 'react'
import { ArrowRight, X, Truck, ChevronRight, ChevronLeft } from 'lucide-react'
import { deriveCategories, getAllProducts } from '../data/productService'
import { getRecentlyViewedIds } from '../data/recentlyViewed'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useCurrency } from '../context/CurrencyContext'
import { ALL_CATEGORIES, SORT_OPTIONS, useProductFilters } from '../hooks/useProductFilters'
import { CategoryFilter } from '../components/catalog/CategoryFilter'
import { ProductCard } from '../components/catalog/ProductCard'
import { FREE_SHIPPING_THRESHOLD } from '../data/orderStore'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton'
import { SearchBar } from '../components/catalog/SearchBar'
import { SortSelect } from '../components/catalog/SortSelect'
import type { Product } from '../types/product'



const COLLECTIONS = ['Electrónica', 'Ropa', 'Hogar', 'Accesorios', 'Deportes']

export function HomePage() {
  useDocumentTitle()
  const { formatPrice } = useCurrency()

  const [allProducts, setAllProducts] = useState<Product[] | null>(null)

  const recentlyViewedRef = useRef<HTMLDivElement>(null)

  function scrollRecentlyViewed(direction: 'left' | 'right') {
    if (recentlyViewedRef.current) {
      recentlyViewedRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' })
    }
  }

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
      {/* Portada */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Objetos para el día a día
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
            Electrónica, ropa, hogar, accesorios y deportes. Buscá, comparalos y armá tu pedido.
          </p>
          <a
            href="#catalogo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
          >
            Ver el catálogo
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Envío */}
      <section className="border-b border-ink/10 bg-surface/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 text-sm text-ink/70 sm:px-6">
          <Truck size={18} className="text-accent" />
          Envío gratis en compras desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Categorías</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLLECTIONS.map((cat) => (
            <a
              key={cat}
              href="#catalogo"
              onClick={() => setSelectedCategory(cat)}
              className="group flex items-center justify-between rounded-xl border border-ink/10 px-4 py-5 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <span className="font-display text-base font-semibold">{cat}</span>
              <ArrowRight size={16} className="text-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </a>
          ))}
        </div>
      </section>

      {/* ─── RECENTLY VIEWED ────────────────────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Seguiste viendo</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollRecentlyViewed('left')} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scrollRecentlyViewed('right')} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div 
            ref={recentlyViewedRef}
            className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-none"
          >
            {recentlyViewed.map((product, index) => (
              <div key={product.id} className="w-44 flex-none sm:w-52">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── CATÁLOGO ───────────────────────────────────────────────────── */}
      <section id="catalogo" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Productos</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Catálogo
            </h2>
          </div>
          {allProducts && (
            <p className="text-sm text-ink/40">{filteredProducts.length} productos</p>
          )}
        </div>

        {/* Filters bar */}
        <div className="mb-6 mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        {/* Active filter chips */}
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
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="rounded-full border border-ink/15 px-8 py-3 text-sm font-medium text-ink transition-all duration-150 hover:border-accent hover:text-accent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  Cargar más productos
                </button>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  )
}
