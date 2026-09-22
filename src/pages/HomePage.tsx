import { useEffect, useMemo, useState, useRef } from 'react'
import { ArrowRight, X, ShieldCheck, RefreshCw, Truck, Headphones, Star, ChevronRight, ChevronLeft } from 'lucide-react'
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



const TRUST_BADGES = [
  { icon: Truck, title: 'Envío gratis', subtitle: 'En compras +{{FREE_SHIPPING_THRESHOLD}}' },
  { icon: ShieldCheck, title: 'Pago seguro', subtitle: '100% protegido' },
  { icon: RefreshCw, title: 'Devoluciones', subtitle: '30 días sin costo' },
  { icon: Headphones, title: 'Soporte 24/7', subtitle: 'Siempre disponible' },
]

const CATEGORY_COVERS: Record<string, string> = {
  'Electrónica': '/images/cat-electronica.jpg',
  'Ropa':         '/images/cat-ropa.jpg',
  'Hogar':        '/images/cat-hogar.jpg',
  'Accesorios':   '/images/cat-accesorios.jpg',
  'Deportes':     '/images/cat-deportes.jpg',
}

const TESTIMONIALS = [
  {
    name: 'Valentina R.',
    avatar: 'VR',
    rating: 5,
    text: 'Increíble calidad en los productos y el envío fue rapidísimo. ¡Definitivamente vuelvo a comprar!',
    product: 'Auriculares Inalámbricos Aura',
  },
  {
    name: 'Martín G.',
    avatar: 'MG',
    rating: 5,
    text: 'La atención al cliente es excelente. Me ayudaron con mi consulta en minutos y el producto llegó perfecto.',
    product: 'Mochila Urbana Voyager',
  },
  {
    name: 'Lucía P.',
    avatar: 'LP',
    rating: 5,
    text: 'Compré el set de tazas y son hermosas. La presentación del packaging fue un detalle muy lindo.',
    product: 'Set de Tazas Cerámica Nube',
  },
]

export function HomePage() {
  useDocumentTitle()
  const { formatPrice } = useCurrency()

  const [allProducts, setAllProducts] = useState<Product[] | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
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
      {/* ─── HERO IMMERSIVE ─────────────────────────────────────────────────────── */}
      <section className="relative h-[95vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
        {/* Cinematic Video background */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-60 scale-105 animate-[slow-zoom_20s_ease-out_infinite_alternate]"
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1616423641405-b461825b16c5?w=2000&q=80"
          >
            <source
              src="https://videos.pexels.com/video-files/3252018/3252018-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Dramatic Vignette and Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-accent/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto mt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Colección 2026
          </span>

          <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] font-semibold leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 drop-shadow-sm">
            Diseño que <br className="hidden md:block" />
            <span className="text-white italic pr-4">inspir<span className="text-accent/90">a</span>.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg md:text-xl font-light leading-relaxed text-white/70">
            Una selección curada de objetos cotidianos elevados a su máxima expresión. Materiales premium, estética impecable.
          </p>

          <div className="mt-12 flex items-center justify-center">
            <a
              href="#catalogo"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 font-semibold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explorar Colección
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] uppercase tracking-widest">Explorar</span>
          <div className="h-8 w-px rounded-full bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ─── TRUST MARQUEE ──────────────────────────────────────────────── */}
      <section className="border-b border-ink/8 bg-surface/60 overflow-hidden py-4">
        <div className="flex w-max animate-marquee items-center gap-12 px-6 sm:gap-24">
          {[...TRUST_BADGES, ...TRUST_BADGES, ...TRUST_BADGES].map(({ icon: Icon, title, subtitle }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Icon size={20} className="text-accent" />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-xs text-ink/50">{subtitle.replace('{{FREE_SHIPPING_THRESHOLD}}', formatPrice(FREE_SHIPPING_THRESHOLD))}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COLECCIONES DESTACADAS ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Explorar</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Colecciones
            </h2>
          </div>
          <a href="#catalogo" className="hidden items-center gap-1 text-sm font-medium text-ink/50 hover:text-accent transition-colors sm:flex">
            Ver todo <ChevronRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {Object.entries(CATEGORY_COVERS).map(([cat, img], i) => (
            <a
              key={cat}
              href={`#catalogo`}
              onClick={() => setSelectedCategory(cat)}
              className={`group relative overflow-hidden rounded-2xl bg-ink/10 ${
                i === 0 ? 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2' : ''
              }`}
              style={{ aspectRatio: i === 0 ? '1' : '3/4' }}
            >
              <img
                src={img}
                alt={cat}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-display text-sm font-semibold text-paper sm:text-base">{cat}</p>
                <span className="inline-flex items-center gap-1 text-xs text-paper/70 group-hover:text-paper/90 transition-colors">
                  Ver más <ArrowRight size={11} />
                </span>
              </div>
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

      {/* ─── TESTIMONIOS ───────────────────────────────────────────────── */}
      <section className="border-t border-ink/8 bg-surface/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Reviews</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Lo que dicen nuestros clientes
            </h2>
            <div className="mt-2 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-accent-2 text-accent-2" />
              ))}
              <span className="ml-2 text-sm text-ink/50">4.7 / 5 · +2,400 reseñas</span>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="group rounded-2xl border border-ink/10 bg-paper p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg hover:shadow-ink/5"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-accent-2 text-accent-2" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-ink/70">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-ink/40">{t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
