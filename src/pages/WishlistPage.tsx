import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { getProductById, type ProductDetail } from '../data/productService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWishlist } from '../hooks/useWishlist'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton'

export function WishlistPage() {
  useDocumentTitle('Favoritos')

  const { state } = useWishlist()
  const [searchParams] = useSearchParams()
  const sharedIds = searchParams.get('compartido')?.split(',').filter(Boolean) ?? null
  const isSharedView = sharedIds !== null

  const productIds = isSharedView ? sharedIds : state.productIds
  const [products, setProducts] = useState<ProductDetail[] | null>(null)

  useEffect(() => {
    let cancelled = false
    setProducts(null)

    Promise.all(productIds.map((id) => getProductById(id))).then((results) => {
      if (cancelled) return
      setProducts(results.filter((product): product is ProductDetail => product !== undefined))
    })

    return () => {
      cancelled = true
    }
  }, [productIds])

  async function handleShare() {
    const url = `${window.location.origin}/favoritos?compartido=${state.productIds.join(',')}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado al portapapeles')
    } catch {
      toast.error('No pudimos copiar el link')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {isSharedView ? 'Lista compartida' : 'Tus favoritos'}
          </h1>
          <p className="mt-2 text-ink/60">
            {isSharedView
              ? 'Estos son los productos que alguien más guardó y quiso compartir.'
              : 'Los productos que guardaste para más tarde.'}
          </p>
        </div>
        {!isSharedView && state.productIds.length > 0 && (
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Share2 size={15} /> Compartir
          </button>
        )}
      </div>

      <div className="mt-8">
        {products === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products}
            emptyMessage={isSharedView ? 'Esta lista compartida está vacía.' : 'Todavía no agregaste favoritos.'}
          />
        )}
      </div>
    </div>
  )
}
