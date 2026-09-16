import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewsletterForm } from './NewsletterForm'

const SOCIAL_LINKS = ['IG', 'X', 'FB'] as const

export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-semibold text-ink">
            Tienda<span className="italic text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink/60">
            Catálogo de ejemplo con datos de prueba — una base de e-commerce pensada para
            adaptarse a cualquier rubro.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {SOCIAL_LINKS.map((label) => (
              <a
                key={label}
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-xs font-semibold text-ink/60 transition-all duration-150 hover:border-accent hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-ink">Tienda</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/60">
            <li>
              <Link to="/" className="transition-colors hover:text-accent">
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/favoritos" className="transition-colors hover:text-accent">
                Favoritos
              </Link>
            </li>
            <li>
              <Link to="/pedido" className="transition-colors hover:text-accent">
                Rastrear pedido
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-ink">Contacto</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/60">
            <li className="flex items-center gap-2">
              <Mail size={15} /> hola@tienda.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} /> +54 11 5555-0000
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={15} /> Buenos Aires, Argentina
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-ink">Novedades</p>
          <p className="mt-3 text-sm text-ink/60">Sumate para enterarte de lanzamientos y ofertas.</p>
          <div className="mt-3">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10 py-6">
        <p className="mx-auto max-w-6xl px-6 text-center text-xs text-ink/40">
          © {new Date().getFullYear()} Tienda. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
