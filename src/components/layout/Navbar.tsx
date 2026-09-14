import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { ThemeToggle } from '../common/ThemeToggle'

export function Navbar() {
  const { itemCount, toggleCart } = useCart()
  const { count: wishlistCount } = useWishlist()

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          Tienda<span className="italic text-accent">.</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            to="/favoritos"
            className="relative flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            aria-label="Ver favoritos"
          >
            <Heart size={18} strokeWidth={1.75} />
            <span className="hidden sm:inline">Favoritos</span>
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-2 px-1 text-xs font-semibold text-on-accent-2">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleCart}
            className="relative flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            aria-label="Abrir carrito"
          >
            <ShoppingBag size={18} strokeWidth={1.75} />
            <span className="hidden sm:inline">Carrito</span>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-on-accent">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
