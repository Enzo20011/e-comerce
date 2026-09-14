import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">404</h1>
      <p className="text-ink/60">No encontramos la página que buscás.</p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
      >
        Volver al catálogo
      </Link>
    </div>
  )
}
