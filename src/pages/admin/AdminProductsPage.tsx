import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Plus, Search, SquarePen, Trash2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteProduct, getAllProducts, LOW_STOCK_THRESHOLD } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/TableSkeleton'
import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })
const PAGE_SIZE = 10

function csvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadProductsCsv(products: Product[]): void {
  const header = ['Producto', 'Categoría', 'Precio', 'Stock'].join(',')
  const rows = products.map((product) =>
    [product.name, product.category, currency.format(product.price), String(product.stock)]
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
        <h1 className="font-display text-2xl font-semibold text-ink">Productos</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => downloadProductsCsv(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            <Download size={15} /> Exportar CSV
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Plus size={16} /> Nuevo producto
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full rounded-full border border-ink/15 bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <button
          type="button"
          onClick={() => setLowStockOnly((value) => !value)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
            lowStockOnly
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-ink/15 text-ink/60 hover:text-ink'
          }`}
        >
          <TriangleAlert size={15} />
          Stock bajo {lowStockCount > 0 && `(${lowStockCount})`}
        </button>
      </div>

      {products === null ? (
        <TableSkeleton rows={8} columns={5} />
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No encontramos productos con esos filtros." />
        </div>
      ) : (
        <>
          {/* Tabla: sm y arriba */}
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
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
                {paginated.map((product) => (
                  <tr key={product.id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-ink">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{product.category}</td>
                    <td className="px-4 py-3 text-ink/60">{currency.format(product.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.stock === 0
                            ? 'font-medium text-accent'
                            : product.stock <= LOW_STOCK_THRESHOLD
                              ? 'font-medium text-accent-2'
                              : 'text-ink/60'
                        }
                      >
                        {product.stock === 0 ? 'Sin stock' : product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          aria-label={`Editar ${product.name}`}
                          className="rounded-full text-ink/50 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                          <SquarePen size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(product)}
                          aria-label={`Eliminar ${product.name}`}
                          className="rounded-full text-ink/50 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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

          {/* Tarjetas: debajo de sm, sin scroll horizontal */}
          <div className="mt-6 flex flex-col gap-3 sm:hidden">
            {paginated.map((product) => (
              <div key={product.id} className="rounded-2xl border border-ink/10 bg-surface/50 p-4">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt="" className="h-12 w-12 flex-none rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-ink/50">{product.category}</p>
                  </div>
                  <div className="flex flex-none items-center gap-3">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      aria-label={`Editar ${product.name}`}
                      className="rounded-full text-ink/50 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                      <SquarePen size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(product)}
                      aria-label={`Eliminar ${product.name}`}
                      className="rounded-full text-ink/50 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                  <span className="font-semibold text-ink">{currency.format(product.price)}</span>
                  <span
                    className={
                      product.stock === 0
                        ? 'font-medium text-accent'
                        : product.stock <= LOW_STOCK_THRESHOLD
                          ? 'font-medium text-accent-2'
                          : 'text-ink/60'
                    }
                  >
                    {product.stock === 0 ? 'Sin stock' : `${product.stock} en stock`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink/50">
          <span>
            Página {page} de {pageCount} · {filtered.length} productos
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 transition-all duration-150 hover:border-accent hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount}
              aria-label="Página siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 transition-all duration-150 hover:border-accent hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
