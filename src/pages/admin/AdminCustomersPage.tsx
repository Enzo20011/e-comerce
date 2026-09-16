import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Search, Users } from 'lucide-react'
import { getAllOrders } from '../../data/orderStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { EmptyState } from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/TableSkeleton'
import { getCustomers, type Customer } from '../../utils/analytics'
import type { Order } from '../../types/order'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })
const PAGE_SIZE = 15

function csvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadCustomersCsv(customers: Customer[]): void {
  const header = ['Cliente', 'Email', 'Pedidos', 'Total gastado', 'Último pedido'].join(',')
  const rows = customers.map((customer) =>
    [
      customer.name,
      customer.email,
      String(customer.orderCount),
      currency.format(customer.totalSpent),
      new Date(customer.lastOrderAt).toLocaleDateString('es-AR'),
    ]
      .map(csvValue)
      .join(','),
  )

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminCustomersPage() {
  useDocumentTitle('Admin — Clientes')

  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getAllOrders().then(setOrders)
  }, [])

  const customers = useMemo(() => getCustomers(orders ?? []), [orders])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(
      (customer) => customer.name.toLowerCase().includes(term) || customer.email.includes(term),
    )
  }, [customers, search])

  useEffect(() => {
    setPage(1)
  }, [search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Clientes</h1>
        <button
          type="button"
          onClick={() => downloadCustomersCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-150 hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>
      <p className="mt-1 text-sm text-ink/50">Clientes derivados de los pedidos realizados.</p>

      <div className="relative mt-6 sm:max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full rounded-full border border-ink/15 bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {orders === null ? (
        <TableSkeleton rows={8} columns={5} />
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No encontramos clientes con esos filtros." />
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Pedidos</th>
                  <th className="px-4 py-3 font-medium">Total gastado</th>
                  <th className="px-4 py-3 font-medium">Último pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {paginated.map((customer) => (
                  <tr
                    key={customer.email}
                    onClick={() => navigate(`/admin/customers/${encodeURIComponent(customer.email)}`)}
                    className="cursor-pointer hover:bg-ink/[0.02]"
                  >
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink/5 text-ink/50">
                        <Users size={15} />
                      </div>
                      <span className="font-medium text-ink">{customer.name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{customer.email}</td>
                    <td className="px-4 py-3 text-ink/60">
                      {customer.orderCount}
                      {customer.orderCount > 1 && (
                        <span className="ml-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                          recurrente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {currency.format(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {new Date(customer.lastOrderAt).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:hidden">
            {paginated.map((customer) => (
              <button
                type="button"
                key={customer.email}
                onClick={() => navigate(`/admin/customers/${encodeURIComponent(customer.email)}`)}
                className="rounded-2xl border border-ink/10 bg-surface/50 p-4 text-left transition-transform duration-150 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ink/5 text-ink/50">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{customer.name}</p>
                    <p className="truncate text-xs text-ink/50">{customer.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                  <span className="text-ink/60">{customer.orderCount} pedidos</span>
                  <span className="font-semibold text-ink">{currency.format(customer.totalSpent)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink/50">
          <span>
            Página {page} de {pageCount} · {filtered.length} clientes
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
    </div>
  )
}
