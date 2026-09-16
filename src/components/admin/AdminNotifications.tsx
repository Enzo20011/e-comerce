import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, PackageX, Receipt } from 'lucide-react'
import { getAllOrders } from '../../data/orderStore'
import { getLowStockProducts } from '../../data/productService'
import type { Order } from '../../types/order'
import type { Product } from '../../types/product'

const LAST_SEEN_KEY = 'ecomerce.admin.notificationsLastSeen'

function getLastSeen(): number {
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY)
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

function setLastSeen(timestamp: number): void {
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(timestamp))
  } catch {
    // almacenamiento no disponible
  }
}

export function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const [newOrders, setNewOrders] = useState<Order[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [unseenOrders, setUnseenOrders] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lastSeen = getLastSeen()
    Promise.all([getAllOrders(), getLowStockProducts()]).then(([orders, products]) => {
      const recent = orders
        .filter((order) => new Date(order.createdAt).getTime() > lastSeen)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8)
      setNewOrders(recent)
      setUnseenOrders(recent.length)
      setLowStock(products)
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleToggle() {
    setOpen((current) => {
      const next = !current
      if (next) {
        setLastSeen(Date.now())
        setUnseenOrders(0)
      }
      return next
    })
  }

  const totalBadge = unseenOrders + lowStock.length

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-all duration-150 hover:bg-ink/5 hover:text-ink active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Bell size={18} />
        {totalBadge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-on-accent">
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-rise-in absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-ink/10 bg-surface p-2 shadow-xl">
          {newOrders.length === 0 && lowStock.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink/50">Todo al día. No hay novedades.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {newOrders.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-ink/40">
                    Pedidos nuevos
                  </p>
                  {newOrders.map((order) => (
                    <Link
                      key={order.orderNumber}
                      to="/admin/orders"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-ink/5"
                    >
                      <Receipt size={14} className="flex-none text-accent" />
                      <span className="min-w-0 flex-1 truncate text-ink/80">
                        {order.orderNumber} · {order.shipping.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {lowStock.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-ink/40">
                    Stock bajo
                  </p>
                  {lowStock.map((product) => (
                    <Link
                      key={product.id}
                      to="/admin/products"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-ink/5"
                    >
                      <PackageX size={14} className="flex-none text-accent-2" />
                      <span className="min-w-0 flex-1 truncate text-ink/80">
                        {product.name} · quedan {product.stock}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
