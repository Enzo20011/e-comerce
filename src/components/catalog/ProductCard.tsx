import { useEffect, useRef, useState } from 'react'
import { Heart, Scale, Star, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useCompare } from '../../hooks/useCompare'
import type { Product } from '../../types/product'
import { useCurrency } from '../../context/CurrencyContext'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { formatPrice } = useCurrency()
  const { addItemSilent, openCart } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const wishlisted = isWishlisted(product.id)
  const { isComparing, toggleItem: toggleCompare } = useCompare()
  const comparing = isComparing(product.id)
  const lowStock = product.stock > 0 && product.stock <= 5

  const [justAdded, setJustAdded] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const revertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (revertTimeout.current) clearTimeout(revertTimeout.current)
  }, [])

  function handleAdd() {
    addItemSilent(product)
    setJustAdded(true)
    
    toast.custom((t) => (
      <div className="flex w-full min-w-[320px] max-w-sm items-center gap-4 rounded-2xl border border-ink/10 bg-surface/95 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in slide-in-from-top-5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
          <img src={product.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <span className="font-display text-sm font-medium tracking-wide text-ink">Añadido al carrito</span>
          <span className="text-xs text-ink/70 line-clamp-1">{product.name}</span>
        </div>
        <button 
          onClick={() => { toast.dismiss(t); openCart(); }}
          className="shrink-0 rounded-xl bg-ink px-4 py-2 text-xs font-semibold tracking-wide text-paper transition-all hover:opacity-90 active:scale-95"
        >
          Ver
        </button>
      </div>
    ), { duration: 4000 })

    if (revertTimeout.current) clearTimeout(revertTimeout.current)
    revertTimeout.current = setTimeout(() => setJustAdded(false), 1200)
  }

  const hasSecondImage = product.images && product.images.length > 1

  return (
    <div
      style={{ animationDelay: `${(index % 12) * 40}ms` }}
      className="animate-rise-in group relative flex flex-col overflow-hidden rounded-3xl bg-transparent transition-all duration-500 hover:-translate-y-2"
      onMouseEnter={() => hasSecondImage && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      {/* Image area */}
      <div className="relative overflow-hidden rounded-3xl bg-ink/5 aspect-[4/5] shadow-sm transition-shadow duration-500 group-hover:shadow-xl group-hover:shadow-ink/10">
        <Link to={`/product/${product.id}`} className="block absolute inset-0">
          {/* Primary image */}
          <img
            src={product.images?.[0] ?? product.image}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              imgIdx === 1 ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-105'
            }`}
          />
          {/* Second image (hover) */}
          {hasSecondImage && (
            <img
              src={product.images![1]}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                imgIdx === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          )}
        </Link>

        {/* Top action buttons */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => toggleItem(product.id)}
            aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-ink/70 backdrop-blur transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 shadow-sm"
          >
            <Heart size={15} className={wishlisted ? 'fill-accent text-accent' : ''} />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            aria-label={comparing ? `Quitar ${product.name} de la comparación` : `Agregar ${product.name} a comparar`}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 backdrop-blur transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 shadow-sm ${
              comparing ? 'text-accent' : 'text-ink/70 hover:text-accent'
            }`}
          >
            <Scale size={15} />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {lowStock && (
            <span className="rounded-full bg-accent-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-accent-2 shadow-sm">
              Últimas {product.stock}!
            </span>
          )}
          {product.stock === 0 && (
            <span className="rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-paper backdrop-blur shadow-sm">
              Sin stock
            </span>
          )}
        </div>

        {/* Quick add button (visible on hover) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-8 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 p-4">
          <button
            onClick={(e) => {
              e.preventDefault()
              handleAdd()
            }}
            disabled={product.stock === 0}
            className="relative w-full overflow-hidden rounded-2xl bg-paper/90 px-4 py-3.5 text-sm font-semibold text-ink shadow-lg backdrop-blur-xl transition-all hover:bg-paper hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 border border-ink/10"
          >
            {justAdded ? (
              <span className="flex items-center gap-2 text-accent-vivid animate-in fade-in zoom-in duration-300">
                <Check size={18} strokeWidth={3} /> Agregado
              </span>
            ) : (
              <span className="flex items-center gap-2">Agregar al carrito</span>
            )}
          </button>
        </div>
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col gap-1.5 px-2 py-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
          {product.category}
        </span>
        <Link to={`/product/${product.id}`} className="font-display text-base font-medium leading-snug text-ink transition-colors hover:text-accent">
          {product.name}
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.round(product.rating!) ? 'fill-accent-2 text-accent-2' : 'fill-ink/10 text-ink/20'}
              />
            ))}
            <span className="ml-0.5 text-[10px] text-ink/40">{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-1 flex items-center">
          <span className="font-sans text-lg font-semibold tracking-tight text-ink">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  )
}
