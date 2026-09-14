import { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { getProductById, getRelatedProducts } from '../data/productService'
import { getReviewsForProduct } from '../data/reviewService'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { QuantityStepper } from '../components/common/QuantityStepper'
import { Breadcrumbs } from '../components/common/Breadcrumbs'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { ReviewList } from '../components/product/ReviewList'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = id ? getProductById(id) : undefined
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  useDocumentTitle(product?.name)

  if (!product) {
    return <Navigate to="/404" replace />
  }

  const reviews = getReviewsForProduct(product.id)
  const related = getRelatedProducts(product.id)
  const wishlisted = isWishlisted(product.id)

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Breadcrumbs
        items={[{ label: 'Catálogo', to: '/' }, { label: product.category }, { label: product.name }]}
      />

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-ink/10">
            <img
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.name}
              className="animate-rise-in aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border transition-colors ${
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

          <p className="mt-1 text-sm text-ink/50">
            {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <QuantityStepper quantity={quantity} max={product.stock} onChange={setQuantity} />
            <button
              type="button"
              onClick={() => addItem(product, quantity)}
              disabled={product.stock === 0}
              className="flex-1 rounded-full bg-ink py-3 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
            >
              Agregar al carrito
            </button>
            <button
              type="button"
              onClick={() => toggleItem(product.id)}
              aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:border-accent hover:text-accent"
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

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">También te puede interesar</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  )
}
