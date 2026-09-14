import { useEffect, useState } from 'react'
import { LayoutDashboard, LogOut, Menu, Package, Receipt, X } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ThemeToggle } from '../../components/common/ThemeToggle'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package, end: false },
  { to: '/admin/orders', label: 'Pedidos', icon: Receipt, end: false },
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
    <div className="min-h-screen bg-paper text-ink lg:flex">
      <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          className="text-ink/70"
        >
          <Menu size={22} />
        </button>
        <p className="font-display text-lg font-semibold">
          Tienda<span className="italic text-accent">.</span>
          <span className="ml-1 text-xs font-normal text-ink/40">admin</span>
        </p>
        <ThemeToggle />
      </header>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-none flex-col border-r border-ink/10 bg-paper p-4 transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-56 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <p className="font-display text-lg font-semibold">
            Tienda<span className="italic text-accent">.</span>
            <span className="ml-1 text-xs font-normal text-ink/40">admin</span>
          </p>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="text-ink/50 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-ink/5'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-between px-1 pb-2 lg:flex">
          <span className="text-xs text-ink/40">Tema</span>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-ink/5"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
