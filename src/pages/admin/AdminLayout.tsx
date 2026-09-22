import { useEffect, useState } from 'react'
import {
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  Package,
  Receipt,
  Tag,
  Coins,
  Users,
  X,
  Store
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { AdminNotifications } from '../../components/admin/AdminNotifications'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package, end: false },
  { to: '/admin/orders', label: 'Pedidos', icon: Receipt, end: false },
  { to: '/admin/customers', label: 'Clientes', icon: Users, end: false },
  { to: '/admin/reviews', label: 'Reseñas', icon: MessageSquareText, end: false },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail, end: false },
  { to: '/admin/coupons', label: 'Cupones', icon: Tag, end: false },
  { to: '/admin/currencies', label: 'Monedas', icon: Coins, end: false },
  { to: '/admin/activity', label: 'Actividad', icon: History, end: false },
]

export function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-sans lg:flex selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-md p-1.5 text-ink/50 transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-ink text-paper">
              <Store size={14} />
            </div>
            <span className="font-semibold text-ink">Tienda</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminNotifications />
        </div>
      </header>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-none flex-col border-r border-ink/10 bg-surface transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-[240px] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-transparent px-4 py-4 lg:py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper shadow-sm">
              <Store size={16} />
            </div>
            <span className="font-semibold tracking-tight text-ink">Tienda Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
            Principal
          </div>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-ink text-paper'
                    : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={18} 
                    className={`transition-colors ${isActive ? 'text-paper' : 'text-ink/40 group-hover:text-ink/70'}`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut size={18} className="text-ink/40 group-hover:text-red-500" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
          <div className="mb-8 hidden items-center justify-end lg:flex">
            <div className="flex items-center gap-4">
              <AdminNotifications />
              <div className="h-6 w-px bg-ink/10"></div>
              <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-ink/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-sm font-medium text-ink/70">
                  AD
                </div>
                <span className="text-sm font-medium text-ink/80">Admin User</span>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
