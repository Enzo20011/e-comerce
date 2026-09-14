import { getProductById } from '../data/productService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWishlist } from '../hooks/useWishlist'
import { ProductGrid } from '../components/catalog/ProductGrid'

export function WishlistPage() {
  useDocumentTitle('Favoritos')

  const { state } = useWishlist()
  const products = state.productIds
    .map((id) => getProductById(id))
    .filter((product): product is NonNullable<typeof product> => product !== undefined)

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Tus favoritos</h1>
      <p className="mt-2 text-ink/60">Los productos que guardaste para más tarde.</p>

      <div className="mt-8">
        <ProductGrid products={products} emptyMessage="Todavía no agregaste favoritos." />
      </div>
    </div>
  )
}
