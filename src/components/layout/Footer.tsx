import { Share2, AtSign, Globe, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewsletterForm } from './NewsletterForm'

const SOCIAL_LINKS = [
  { label: 'Instagram', icon: AtSign, href: '#' },
  { label: 'Twitter / X', icon: Share2, href: '#' },
  { label: 'Web', icon: Globe, href: '#' },
]

// Simple SVG payment icons as inline components
function VisaIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Visa">
      <rect width="38" height="24" rx="4" fill="#1A1F71" />
      <text x="19" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VISA</text>
    </svg>
  )
}
function MastercardIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard">
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="14" cy="12" r="7" fill="#EB001B" />
      <circle cx="24" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" />
    </svg>
  )
}
function AmexIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="American Express">
      <rect width="38" height="24" rx="4" fill="#2557D6" />
      <text x="19" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  )
}
function MpIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="MercadoPago">
      <rect width="38" height="24" rx="4" fill="#009EE3" />
      <text x="19" y="16" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="bold" fontFamily="Arial">MERCADO</text>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="font-display text-xl font-semibold text-ink">
            Tienda<span className="italic text-accent">.</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">
            Catálogo con búsqueda instantánea, filtros por categoría y carrito dinámico. Cada pieza, elegida con intención.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 text-ink/50 transition-all duration-150 hover:border-accent hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Tienda links */}
        <div>
          <p className="text-sm font-semibold text-ink">Tienda</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li><Link to="/" className="transition-colors hover:text-accent">Catálogo</Link></li>
            <li><Link to="/favoritos" className="transition-colors hover:text-accent">Favoritos</Link></li>
            <li><Link to="/pedido" className="transition-colors hover:text-accent">Rastrear pedido</Link></li>
            <li><Link to="/comparar" className="transition-colors hover:text-accent">Comparar productos</Link></li>
          </ul>

          <p className="mt-6 text-sm font-semibold text-ink">Ayuda</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li><a href="#" className="transition-colors hover:text-accent">Términos y condiciones</a></li>
            <li><a href="#" className="transition-colors hover:text-accent">Política de privacidad</a></li>
            <li><a href="#" className="transition-colors hover:text-accent">Envíos y devoluciones</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold text-ink">Contacto</p>
          <ul className="mt-4 space-y-3 text-sm text-ink/60">
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0 text-accent/70" /> hola@tienda.com
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0 text-accent/70" /> +54 11 5555-0000
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="shrink-0 text-accent/70" /> Buenos Aires, Argentina
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <p className="text-sm font-semibold text-ink">Novedades</p>
          <p className="mt-3 text-sm text-ink/60">Sumate para enterarte de lanzamientos y ofertas exclusivas.</p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row">
          {/* Copyright + SSL badge */}
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-ink/30" />
            <p className="text-xs text-ink/40">
              © {new Date().getFullYear()} Tienda. Sitio seguro SSL.
            </p>
          </div>

          {/* Payment methods */}
          <div className="flex items-center gap-2" aria-label="Métodos de pago aceptados">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <MpIcon />
          </div>
        </div>
      </div>
    </footer>
  )
}
