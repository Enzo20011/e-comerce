import type { Product } from '../../types/product'
import { EmptyState } from '../common/EmptyState'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
  bento?: boolean
}

export function ProductGrid({
  products,
  emptyMessage = 'No encontramos productos con esos filtros.',
  bento = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          size={bento && index === 0 && product.featured ? 'large' : 'default'}
        />
      ))}
    </div>
  )
}
