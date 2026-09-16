import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">404</h1>
      <p className="text-ink/60">No encontramos la página que buscás.</p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        Volver al catálogo
      </Link>
    </div>
  )
}
