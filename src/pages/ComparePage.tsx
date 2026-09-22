import { useEffect, useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { Link } from 'react-router-dom'
import { Check, Star, X } from 'lucide-react'
import { getAllProducts } from '../data/productService'
import { useCompare } from '../hooks/useCompare'
import { useCart } from '../hooks/useCart'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { EmptyState } from '../components/common/EmptyState'
import type { Product } from '../types/product'



export function ComparePage() {
  const { formatPrice } = useCurrency()
  useDocumentTitle('Comparar productos')

  const { state, removeItem } = useCompare()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getAllProducts().then((all) => {
      if (cancelled) return
      const byId = new Map(all.map((product) => [product.id, product]))
      setProducts(state.productIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p)))
    })
    return () => {
      cancelled = true
    }
  }, [state.productIds])

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Comparar productos</h1>
      <p className="mt-2 text-ink/60">Mirá las especificaciones lado a lado antes de decidir.</p>

      <div className="mt-8">
        {products === null ? null : products.length < 2 ? (
          <EmptyState message="Elegí al menos dos productos desde el catálogo para compararlos." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink/10">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-40 border-b border-ink/10 bg-surface/50 p-4 text-left text-xs font-medium uppercase tracking-wide text-ink/40">
                    Producto
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="min-w-[200px] border-b border-ink/10 bg-surface/50 p-4 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${product.id}`} className="flex flex-col items-start gap-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                          <span className="font-display text-sm font-semibold text-ink">{product.name}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          aria-label={`Quitar ${product.name} de la comparación`}
                          className="flex-none rounded-full text-ink/30 transition-colors hover:text-accent"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="p-4 text-xs font-medium uppercase tracking-wide text-ink/40">Precio</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 font-semibold text-ink">
                      {formatPrice(product.price)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-medium uppercase tracking-wide text-ink/40">Categoría</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-ink/70">
                      {product.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-medium uppercase tracking-wide text-ink/40">Calificación</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-ink/70">
                      {product.rating ? (
                        <span className="flex items-center gap-1">
                          <Star size={14} className="fill-accent-2 text-accent-2" /> {product.rating.toFixed(1)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-medium uppercase tracking-wide text-ink/40">Stock</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      {product.stock > 0 ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Check size={14} /> Disponible ({product.stock})
                        </span>
                      ) : (
                        <span className="text-ink/40">Sin stock</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 align-top text-xs font-medium uppercase tracking-wide text-ink/40">Descripción</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 align-top text-ink/60">
                      {product.description}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4" />
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <button
                        type="button"
                        onClick={() => addItem(product)}
                        disabled={product.stock === 0}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                      >
                        Agregar al carrito
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
