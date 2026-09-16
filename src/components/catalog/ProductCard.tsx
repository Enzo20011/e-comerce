import { useEffect, useRef, useState } from 'react'
import { Check, Heart, Plus, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useCompare } from '../../hooks/useCompare'
import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const wishlisted = isWishlisted(product.id)
  const { isComparing, toggleItem: toggleCompare } = useCompare()
  const comparing = isComparing(product.id)
  const lowStock = product.stock > 0 && product.stock <= 5

  const [justAdded, setJustAdded] = useState(false)
  const revertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (revertTimeout.current) clearTimeout(revertTimeout.current)
  }, [])

  function handleAdd() {
    addItem(product)
    setJustAdded(true)
    if (revertTimeout.current) clearTimeout(revertTimeout.current)
    revertTimeout.current = setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div
      style={{ animationDelay: `${(index % 12) * 40}ms` }}
      className="animate-rise-in group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-surface/50 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleItem(product.id)}
          aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-ink/70 backdrop-blur transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <Heart size={16} className={wishlisted ? 'fill-accent text-accent' : ''} />
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          aria-label={comparing ? `Quitar ${product.name} de la comparación` : `Agregar ${product.name} a comparar`}
          className={`absolute right-3 top-14 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 backdrop-blur transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
            comparing ? 'text-accent' : 'text-ink/70 hover:text-accent'
          }`}
        >
          <Scale size={16} />
        </button>
        {lowStock && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-2 px-2.5 py-1 text-[11px] font-semibold text-on-accent-2">
            ¡Últimas {product.stock}!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-paper">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {product.category}
        </span>
        <Link to={`/product/${product.id}`} className="font-display text-sm font-semibold text-ink">
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-semibold text-ink">{currency.format(product.price)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            aria-label={`Agregar ${product.name} al carrito`}
            className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-ink text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
          >
            <Plus
              size={18}
              strokeWidth={2}
              className={`absolute transition-all duration-150 ${
                justAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
              }`}
            />
            <Check
              size={18}
              strokeWidth={2}
              className={`absolute transition-all duration-150 ${
                justAdded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
