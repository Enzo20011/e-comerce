import { Link } from 'react-router-dom'
import { NewsletterForm } from './NewsletterForm'

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link to="/" className="font-display text-xl font-semibold text-ink">
            Tienda
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">
            Tienda de ejemplo con catálogo, carrito, checkout simulado y panel de administración.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Navegar</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li><Link to="/" className="transition-colors hover:text-accent">Catálogo</Link></li>
            <li><Link to="/favoritos" className="transition-colors hover:text-accent">Favoritos</Link></li>
            <li><Link to="/pedido" className="transition-colors hover:text-accent">Seguir un pedido</Link></li>
            <li><Link to="/comparar" className="transition-colors hover:text-accent">Comparar productos</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Novedades</p>
          <p className="mt-3 text-sm text-ink/60">Dejá tu email para recibir novedades de la tienda.</p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-xs text-ink/40">© {new Date().getFullYear()} Tienda</p>
        </div>
      </div>
    </footer>
  )
}
