import { useState } from 'react'
import { Plus, SquarePen, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { deleteProduct, getAllProducts } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

export function AdminProductsPage() {
  useDocumentTitle('Admin — Productos')

  const [products, setProducts] = useState(() => getAllProducts())

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    deleteProduct(id)
    setProducts(getAllProducts())
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Productos</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
        >
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="font-medium text-ink">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-ink/60">{product.category}</td>
                <td className="px-4 py-3 text-ink/60">{currency.format(product.price)}</td>
                <td className="px-4 py-3 text-ink/60">{product.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      aria-label={`Editar ${product.name}`}
                      className="text-ink/50 transition-colors hover:text-accent"
                    >
                      <SquarePen size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      aria-label={`Eliminar ${product.name}`}
                      className="text-ink/50 transition-colors hover:text-accent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
