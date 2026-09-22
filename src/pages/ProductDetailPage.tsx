import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Check, ChevronDown, Eye, Heart, Star, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getAllProducts,
  getFrequentlyBoughtWith,
  getProductById,
  getRelatedProducts,
  type ProductDetail,
} from '../data/productService'
import { getReviewsForProduct } from '../data/reviewService'
import { getRecentlyViewedIds, trackProductView } from '../data/recentlyViewed'
import { toast } from 'sonner'
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
import { useCurrency } from '../context/CurrencyContext'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const { addItemSilent, openCart } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  // useCompare not used in this view
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
    addItemSilent(product, quantity)
    toast.custom((t) => (
      <div className="flex w-full min-w-[320px] max-w-sm items-center gap-4 rounded-2xl border border-ink/10 bg-surface/95 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in slide-in-from-top-5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
          <img src={product.images[0] ?? product.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <span className="font-display text-sm font-medium tracking-wide text-ink">Añadido al carrito</span>
          <span className="text-xs text-ink/70 line-clamp-1">{quantity}x {product.name}</span>
        </div>
        <button 
          onClick={() => { toast.dismiss(t); openCart(); }}
          className="shrink-0 rounded-xl bg-ink px-4 py-2 text-xs font-semibold tracking-wide text-paper transition-all hover:opacity-90 active:scale-95"
        >
          Ver
        </button>
      </div>
    ), { duration: 4000 })
    setJustAdded(true)
    if (revertTimeout.current) clearTimeout(revertTimeout.current)
    revertTimeout.current = setTimeout(() => setJustAdded(false), 1200)
  }

  function handleBuyNow() {
    if (!product) return
    addItemSilent(product, quantity)
    navigate('/checkout')
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px]">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-6 h-14 w-full rounded-full" />
            <Skeleton className="mt-2 h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6">
        <Breadcrumbs
          items={[{ label: 'Catálogo', to: '/' }, { label: product.category }, { label: product.name }]}
        />
      </div>

      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 lg:items-start xl:gap-x-16">
        {/* Left: Sticky Image Gallery */}
        <div className="mx-auto w-full max-w-2xl lg:sticky lg:top-24 lg:max-w-none">
          <div
            onMouseMove={handleGalleryMouseMove}
            className="zoom-on-hover relative aspect-square w-full overflow-hidden rounded-2xl bg-ink/5 md:aspect-square"
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
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-xl bg-ink/5 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    index === activeImage ? 'ring-2 ring-ink ring-offset-2' : 'hover:opacity-80'
                  }`}
                >
                  <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col pt-2 lg:pt-8">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            {product.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          {product.rating && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex text-accent-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product.rating!) ? 'fill-current' : 'fill-ink/10 text-ink/20'}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-ink/80">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-ink/40">·</span>
              <a href="#reviews" className="text-sm text-ink/60 underline underline-offset-4 hover:text-ink transition-colors">
                {reviews.length} reseñas
              </a>
            </div>
          )}

          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-3xl font-medium text-ink">{formatPrice(product.price)}</span>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink/80">Cantidad</span>
                {product.stock === 0 ? (
                  <span className="font-medium text-error">Agotado</span>
                ) : lowStock ? (
                  <span className="font-medium text-accent-2">¡Últimas {product.stock} disponibles!</span>
                ) : (
                  <span className="text-ink/60">{product.stock} disponibles</span>
                )}
              </div>
              <QuantityStepper quantity={quantity} max={product.stock} onChange={setQuantity} />
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-ink py-4 text-base font-semibold text-paper btn-shine transition-all duration-300 hover:bg-accent hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              >
                <span
                  className={`flex items-center justify-center gap-2 transition-transform duration-300 ${
                    justAdded ? '-translate-y-12' : 'translate-y-0'
                  }`}
                >
                  Agregar al carrito
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 ${
                    justAdded ? 'translate-y-0' : 'translate-y-12'
                  }`}
                >
                  <Check size={20} strokeWidth={3} /> ¡Agregado!
                </span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex w-full items-center justify-center rounded-full border-2 border-ink py-3.5 text-base font-semibold text-ink transition-all duration-200 hover:bg-ink hover:text-paper active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Comprar ahora
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => toggleItem(product.id)}
              className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              <Heart size={18} className={wishlisted ? 'fill-accent text-accent' : ''} />
              {wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            </button>
          </div>

          {/* Trust Badges Minimal */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-ink/5 p-6">
            <div className="flex items-start gap-4">
              <Truck className="mt-0.5 text-ink/70" size={20} />
              <div>
                <p className="font-medium text-ink">Envío gratis a todo el país</p>
                <p className="text-sm text-ink/60">Llega entre 2 y 5 días hábiles.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-0.5 text-ink/70" size={20} />
              <div>
                <p className="font-medium text-ink">Pago seguro garantizado</p>
                <p className="text-sm text-ink/60">Tus datos están protegidos por SSL.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <RotateCcw className="mt-0.5 text-ink/70" size={20} />
              <div>
                <p className="font-medium text-ink">Devoluciones sin costo</p>
                <p className="text-sm text-ink/60">Tenés 30 días para cambiarlo.</p>
              </div>
            </div>
          </div>

          {/* Details Accordions */}
          <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
            <details className="group" open>
              <summary className="flex cursor-pointer items-center justify-between py-5 text-base font-medium text-ink transition-colors hover:text-accent focus-visible:outline-none">
                Descripción
                <ChevronDown size={20} className="transition-transform duration-300 group-open:rotate-180 text-ink/50" />
              </summary>
              <div className="pb-5 text-ink/70 leading-relaxed text-sm">
                {product.description}
              </div>
            </details>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between py-5 text-base font-medium text-ink transition-colors hover:text-accent focus-visible:outline-none">
                Envíos y devoluciones
                <ChevronDown size={20} className="transition-transform duration-300 group-open:rotate-180 text-ink/50" />
              </summary>
              <div className="pb-5 text-ink/70 leading-relaxed text-sm">
                <p>Todos nuestros envíos se realizan de forma segura y cuentan con código de seguimiento. El tiempo estimado de entrega es de 2 a 5 días hábiles.</p>
                <p className="mt-2">Si no estás conforme con tu compra, podés devolverla gratis dentro de los primeros 30 días. El producto debe estar en sus condiciones originales.</p>
              </div>
            </details>
          </div>
          
          {product.recentViews >= 3 && (
            <p className="mt-8 flex items-center gap-2 rounded-lg bg-accent-2/10 px-4 py-3 text-sm font-medium text-accent-2">
              <Eye size={16} />
              {product.recentViews} personas están viendo este producto.
            </p>
          )}

        </div>
      </div>

      {/* Sections below */}
      <div className="mt-24 border-t border-ink/10 pt-16" id="reviews">
        <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">Reseñas de clientes</h2>
        <div className="mt-8 max-w-4xl">
          <ReviewList reviews={reviews} />
        </div>
      </div>

      {frequentlyBoughtWith.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">Comprado frecuentemente junto a</h2>
          <div className="mt-8">
            <ProductGrid products={frequentlyBoughtWith} />
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">También te puede interesar</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="mt-24 border-t border-ink/10 pt-16">
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">Vistos recientemente</h2>
          <div className="mt-8">
            <ProductGrid products={recentlyViewed} />
          </div>
        </div>
      )}
    </div>
  )
}
