import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { Download, Plus, Search, SquarePen, Trash2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteProduct, getAllProducts, LOW_STOCK_THRESHOLD } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/TableSkeleton'
import type { Product } from '../../types/product'


const PAGE_SIZE = 10

function csvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadProductsCsv(products: Product[], formatPrice: (n: number) => string): void {
  const header = ['Producto', 'Categoría', 'Precio', 'Stock'].join(',')
  const rows = products.map((product) =>
    [product.name, product.category, formatPrice(product.price), String(product.stock)]
      .map(csvValue)
      .join(','),
  )

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `productos-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminProductsPage() {
  const { formatPrice } = useCurrency()
  useDocumentTitle('Admin — Productos')

  const [products, setProducts] = useState<Product[] | null>(null)
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  const filtered = useMemo(() => {
    if (!products) return []
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      const matchesStock = !lowStockOnly || product.stock <= LOW_STOCK_THRESHOLD
      return matchesSearch && matchesStock
    })
  }, [products, search, lowStockOnly])

  useEffect(() => {
    setPage(1)
  }, [search, lowStockOnly])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const lowStockCount = useMemo(
    () => (products ?? []).filter((product) => product.stock <= LOW_STOCK_THRESHOLD).length,
    [products],
  )

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await deleteProduct(pendingDelete.id)
      setProducts(await getAllProducts())
      toast.success(`"${pendingDelete.name}" eliminado`)
    } catch {
      toast.error('No pudimos eliminar el producto.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Productos</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => downloadProductsCsv(filtered, formatPrice)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-md border border-ink/15 bg-surface px-3 py-1.5 text-sm font-medium text-ink/80 shadow-sm transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} className="text-ink/50" /> Exportar
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Plus size={16} /> Agregar producto
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-ink/10 bg-surface shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between bg-surface/50">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar productos..."
              className="w-full rounded-md border border-ink/15 bg-surface py-1.5 pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="button"
            onClick={() => setLowStockOnly((value) => !value)}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              lowStockOnly
                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400'
                : 'border-ink/15 bg-surface text-ink/80 shadow-sm hover:bg-ink/5'
            }`}
          >
            <TriangleAlert size={16} className={lowStockOnly ? 'text-amber-500' : 'text-ink/40'} />
            Stock bajo {lowStockCount > 0 && `(${lowStockCount})`}
          </button>
        </div>

        {products === null ? (
          <div className="p-4"><TableSkeleton rows={8} columns={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState message="No encontramos productos con esos filtros." />
          </div>
        ) : (
          <>
            {/* Tabla: sm y arriba */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b border-ink/10 bg-ink/5 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  <tr>
                    <th className="px-6 py-3">Producto</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3">Precio</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {paginated.map((product) => (
                    <tr key={product.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img src={product.image} alt="" className="h-10 w-10 rounded border border-gray-200 dark:border-gray-700 object-cover" />
                          </div>
                          <div className="font-medium text-ink">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-ink/50">
                        <span className="inline-flex items-center rounded-md bg-ink/5 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/20">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ink font-medium">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        {product.stock === 0 ? (
                           <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-500/20">
                             Sin stock
                           </span>
                        ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                           <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">
                             {product.stock}
                           </span>
                        ) : (
                          <span className="text-ink/50">{product.stock}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            aria-label={`Editar ${product.name}`}
                            className="rounded p-1 text-ink/40 hover:bg-ink/10 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <SquarePen size={18} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(product)}
                            aria-label={`Eliminar ${product.name}`}
                            className="rounded p-1 text-ink/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas: debajo de sm */}
            <div className="flex flex-col divide-y divide-ink/10 sm:hidden">
              {paginated.map((product) => (
                <div key={product.id} className="p-4 hover:bg-ink/5">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt="" className="h-12 w-12 flex-none rounded border border-gray-200 dark:border-gray-700 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{product.name}</p>
                      <p className="text-xs text-ink/50">{product.category}</p>
                    </div>
                    <div className="flex flex-none items-center gap-1">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        aria-label={`Editar ${product.name}`}
                        className="rounded p-1.5 text-ink/40 hover:bg-ink/10 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <SquarePen size={18} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(product)}
                        aria-label={`Eliminar ${product.name}`}
                        className="rounded p-1.5 text-ink/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
                    {product.stock === 0 ? (
                       <span className="text-xs font-medium text-red-600 dark:text-red-400">Agotado</span>
                    ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                       <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Stock: {product.stock}</span>
                    ) : (
                      <span className="text-xs text-ink/50">Stock: {product.stock}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-ink/10 bg-ink/5 px-4 py-3 sm:px-6">
            <span className="text-sm text-ink/80">
              Página <span className="font-medium text-ink">{page}</span> de <span className="font-medium text-ink">{pageCount}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="relative inline-flex items-center rounded-md bg-surface px-3 py-2 text-sm font-semibold text-ink ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-ink/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
                aria-label="Página siguiente"
                className="relative inline-flex items-center rounded-md bg-surface px-3 py-2 text-sm font-semibold text-ink ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-ink/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={`¿Eliminar "${pendingDelete.name}"?`}
          description="Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
