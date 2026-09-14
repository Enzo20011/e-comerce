import { ArrowDown } from 'lucide-react'
import { getAllProducts, getCategories, getFeaturedProducts } from '../data/productService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useProductFilters } from '../hooks/useProductFilters'
import { CategoryFilter } from '../components/catalog/CategoryFilter'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { SearchBar } from '../components/catalog/SearchBar'
import { SortSelect } from '../components/catalog/SortSelect'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function HomePage() {
  useDocumentTitle()

  const allProducts = getAllProducts()
  const categories = getCategories()
  const heroProduct = getFeaturedProducts()[0] ?? allProducts[0]

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredProducts,
    isDefaultView,
  } = useProductFilters(allProducts)

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

      <section id="catalogo" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xs lg:flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
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

        <ProductGrid products={filteredProducts} bento={isDefaultView} />
      </section>
    </div>
  )
}
