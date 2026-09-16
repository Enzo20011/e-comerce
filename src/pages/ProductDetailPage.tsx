import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Check, Eye, Heart, Star } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import {
  getAllProducts,
  getFrequentlyBoughtWith,
  getProductById,
  getRelatedProducts,
  type ProductDetail,
} from '../data/productService'
import { getReviewsForProduct } from '../data/reviewService'
import { getRecentlyViewedIds, trackProductView } from '../data/recentlyViewed'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { QuantityStepper } from '../components/common/QuantityStepper'
import { Breadcrumbs } from '../components/common/Breadcrumbs'
import { Skeleton } from '../components/common/Skeleton'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { ReviewList } from '../components/product/ReviewList'
import type { Product } from '../types/product'
import type { Review } from '../types/review'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const [product, setProduct] = useState<ProductDetail | null | undefined>(undefined)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [frequentlyBoughtWith, setFrequentlyBoughtWith] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

  const [displayedImage, setDisplayedImage] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState(false)
  const revertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useDocumentTitle(product?.name)

  useEffect(() => {
    if (!product) return
    const timeout = setTimeout(() => setDisplayedImage(product.images[activeImage]), 250)
    return () => clearTimeout(timeout)
  }, [activeImage, product])

  useEffect(() => () => {
    if (revertTimeout.current) clearTimeout(revertTimeout.current)
  }, [])

  function handleAdd() {
    if (!product) return
    addItem(product, quantity)
    setJustAdded(true)
    if (revertTimeout.current) clearTimeout(revertTimeout.current)
    revertTimeout.current = setTimeout(() => setJustAdded(false), 1200)
  }

  function handleGalleryMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    event.currentTarget.style.setProperty('--zoom-x', `${x}%`)
    event.currentTarget.style.setProperty('--zoom-y', `${y}%`)
  }

  useEffect(() => {
    if (!id) return
    setProduct(undefined)
    setQuantity(1)
    setActiveImage(0)

    getProductById(id).then((result) => {
      setProduct(result ?? null)
      if (!result) return

      trackProductView(id)
      const recentIds = getRecentlyViewedIds(id)
      if (recentIds.length === 0) {
        setRecentlyViewed([])
        return
      }
      getAllProducts().then((allProducts) => {
        const byId = new Map(allProducts.map((item) => [item.id, item]))
        setRecentlyViewed(
          recentIds.map((recentId) => byId.get(recentId)).filter((item): item is Product => Boolean(item)),
        )
      })
    })
    getReviewsForProduct(id).then(setReviews)
    getRelatedProducts(id).then(setRelated)
    getFrequentlyBoughtWith(id).then(setFrequentlyBoughtWith)
  }, [id])

  if (product === null) {
    return <Navigate to="/404" replace />
  }

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-4 w-64" />
        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,440px)_1fr]">
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-4 h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Breadcrumbs
        items={[{ label: 'Catálogo', to: '/' }, { label: product.category }, { label: product.name }]}
      />

      <div className="grid gap-10 md:grid-cols-[minmax(0,440px)_1fr]">
        <div>
          <div
            onMouseMove={handleGalleryMouseMove}
            className="zoom-on-hover relative aspect-square overflow-hidden rounded-2xl border border-ink/10"
          >
            {displayedImage && (
              <img
                src={displayedImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <img
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.name}
              className="animate-gallery-fade-in absolute inset-0 h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                    index === activeImage ? 'border-accent' : 'border-ink/10 hover:border-ink/30'
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-accent">
            {product.category}
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {product.name}
          </h1>

          {product.rating && (
            <div className="mt-2 flex items-center gap-1 text-sm text-ink/60">
              <Star size={16} className="fill-accent text-accent" />
              {product.rating.toFixed(1)}
              <span className="text-ink/40">· {reviews.length} reseñas</span>
            </div>
          )}

          <p className="mt-4 text-ink/70">{product.description}</p>

          <p className="mt-6 text-2xl font-semibold text-ink">{currency.format(product.price)}</p>

          <p
            className={`mt-1 text-sm ${
              product.stock > 0 && product.stock <= 5 ? 'font-medium text-accent' : 'text-ink/50'
            }`}
          >
            {product.stock === 0
              ? 'Sin stock'
              : product.stock <= 5
                ? `¡Últimas ${product.stock} unidades!`
                : `${product.stock} unidades disponibles`}
          </p>

          {product.recentViews >= 3 && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
              <Eye size={13} />
              {product.recentViews} personas vieron este producto en las últimas 24 horas
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <QuantityStepper quantity={quantity} max={product.stock} onChange={setQuantity} />
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="relative flex-1 overflow-hidden rounded-full bg-ink py-3 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
            >
              <span
                className={`flex items-center justify-center gap-1.5 transition-all duration-150 ${
                  justAdded ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
                }`}
              >
                Agregar al carrito
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-150 ${
                  justAdded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <Check size={16} /> Agregado
              </span>
            </button>
            <button
              type="button"
              onClick={() => toggleItem(product.id)}
              aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-all duration-150 hover:border-accent hover:text-accent active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <Heart size={18} className={wishlisted ? 'fill-accent text-accent' : ''} />
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-ink">Reseñas</h2>
        <div className="mt-4">
          <ReviewList reviews={reviews} />
        </div>
      </section>

      {frequentlyBoughtWith.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">Comprado frecuentemente junto a</h2>
          <div className="mt-6">
            <ProductGrid products={frequentlyBoughtWith} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">También te puede interesar</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">Vistos recientemente</h2>
          <div className="mt-6">
            <ProductGrid products={recentlyViewed} />
          </div>
        </section>
      )}
    </div>
  )
}
