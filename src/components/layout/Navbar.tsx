import { Search, Heart, ShoppingBag, X, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { ThemeToggle } from '../common/ThemeToggle'
import { CATEGORIES } from '../../data/products'
import { CurrencySelector } from '../common/CurrencySelector'
import { SmartSearch } from './SmartSearch'
import { FREE_SHIPPING_THRESHOLD } from '../../data/orderStore'

import { useCurrency } from '../../context/CurrencyContext'

const ANNOUNCEMENTS = [
  '🚚 Envío gratis en compras +{{FREE_SHIPPING_THRESHOLD}}',
  '💳 3 cuotas sin interés con todas las tarjetas',
  '🔄 Devoluciones gratis dentro de los 30 días',
]

export function Navbar() {
  const { itemCount, toggleCart } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { formatPrice } = useCurrency()
  const [searchOpen, setSearchOpen] = useState(false)
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const navigate = useNavigate()

  // Rotate announcements
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Open search on Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close search on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])



  function scrollToCatalog() {
    const el = document.getElementById('catalogo')
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  function handleCategoryClick(e: React.MouseEvent, cat?: string) {
    e.preventDefault()
    if (mobileMenuOpen) setMobileMenuOpen(false)
    
    const target = cat ? `/?cat=${encodeURIComponent(cat)}` : '/'
    navigate(target, { state: { scrollToCatalog: true } })
    setTimeout(() => scrollToCatalog(), 50)
  }

  return (
    <>
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="relative overflow-hidden bg-ink py-2 text-center text-xs font-medium text-paper">
          <div
            key={announcementIdx}
            className="animate-announcement px-8"
          >
            {ANNOUNCEMENTS[announcementIdx].replace('{{FREE_SHIPPING_THRESHOLD}}', formatPrice(FREE_SHIPPING_THRESHOLD))}
          </div>
          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Cerrar anuncio"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/60 hover:text-paper transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur-md">
        {/* Top row: Logo + Actions */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 hover:text-ink transition-colors lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="font-display text-xl font-semibold tracking-tight text-ink shrink-0">
            Tienda<span className="italic text-accent">.</span>
          </Link>

          {/* Desktop category nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <a
              href="/#catalogo"
              onClick={(e) => handleCategoryClick(e)}
              className="group flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              Todos
            </a>
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`/?cat=${encodeURIComponent(cat)}#catalogo`}
                onClick={(e) => handleCategoryClick(e, cat)}
                className="group flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {cat}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              aria-label="Buscar productos"
            >
              <Search size={18} />
            </button>

            <CurrencySelector />
            <ThemeToggle />

            {/* Wishlist */}
            <Link
              to="/favoritos"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              aria-label="Ver favoritos"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span
                  key={wishlistCount}
                  className="animate-cart-bump absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-bold text-on-accent"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={toggleCart}
              className="relative flex items-center gap-2 rounded-lg border border-ink/15 bg-ink px-4 py-2 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:border-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              aria-label="Abrir carrito"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="animate-cart-bump flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-2 px-1 text-xs font-bold text-on-accent-2"
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-ink/10 bg-paper px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              <a
                href="/#catalogo"
                onClick={(e) => handleCategoryClick(e)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                Todos los productos
              </a>
              {CATEGORIES.map((cat) => (
                <a
                  key={cat}
                  href={`/?cat=${encodeURIComponent(cat)}#catalogo`}
                  onClick={(e) => handleCategoryClick(e, cat)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  {cat}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      <SmartSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
