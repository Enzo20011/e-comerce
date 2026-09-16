import { useEffect, useState } from 'react'
import { Scale, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCompare } from '../../hooks/useCompare'
import { getAllProducts } from '../../data/productService'
import type { Product } from '../../types/product'

export function CompareBar() {
  const { state, removeItem, clearCompare, count } = useCompare()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (count === 0) return
    let cancelled = false
    getAllProducts().then((all) => {
      if (cancelled) return
      setProducts(all.filter((product) => state.productIds.includes(product.id)))
    })
    return () => {
      cancelled = true
    }
  }, [state.productIds, count])

  if (count === 0) return null

  return (
    <div className="animate-rise-in fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-surface/95 px-4 py-3 backdrop-blur-lg sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <Scale size={16} className="text-accent" />
          Comparar ({count})
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {products.map((product) => (
            <span
              key={product.id}
              className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper py-1 pl-1 pr-2 text-xs text-ink/70"
            >
              <img src={product.image} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="max-w-[8rem] truncate">{product.name}</span>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                aria-label={`Quitar ${product.name} de la comparación`}
                className="text-ink/40 transition-colors hover:text-accent"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="rounded-full px-3 py-2 text-xs font-medium text-ink/50 transition-all duration-150 hover:text-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Vaciar
          </button>
          <button
            type="button"
            disabled={count < 2}
            onClick={() => navigate('/comparar')}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            Comparar
          </button>
        </div>
      </div>
    </div>
  )
}
