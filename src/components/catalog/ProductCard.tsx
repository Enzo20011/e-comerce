import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

interface ProductCardProps {
  product: Product
  size?: 'default' | 'large'
  index?: number
}

export function ProductCard({ product, size = 'default', index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const wishlisted = isWishlisted(product.id)
  const isLarge = size === 'large'

  return (
    <div
      style={{ animationDelay: `${(index % 12) * 40}ms` }}
      className={`animate-rise-in group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-surface/50 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg hover:shadow-ink/5 ${
        isLarge ? 'sm:col-span-2 sm:row-span-2' : ''
      }`}
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isLarge ? 'aspect-[4/3] sm:aspect-square' : 'aspect-square'
            }`}
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleItem(product.id)}
          aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-ink/70 backdrop-blur transition-colors hover:text-accent"
        >
          <Heart size={16} className={wishlisted ? 'fill-accent text-accent' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {product.category}
        </span>
        <Link
          to={`/product/${product.id}`}
          className={`font-display font-semibold text-ink ${isLarge ? 'text-lg' : 'text-sm'}`}
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className={`font-semibold text-ink ${isLarge ? 'text-xl' : 'text-base'}`}>
            {currency.format(product.price)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            aria-label={`Agregar ${product.name} al carrito`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
