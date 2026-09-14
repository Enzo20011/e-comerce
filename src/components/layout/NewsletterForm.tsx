import { useState, type FormEvent } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
  }

  if (submitted) {
    return <p className="text-sm text-accent">¡Gracias por sumarte! Vas a recibir nuestras novedades.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="tu@email.com"
        className="min-w-0 flex-1 rounded-full border border-ink/15 bg-surface/60 px-4 py-2 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-accent"
      />
      <button
        type="submit"
        className="flex-none rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
      >
        Sumarme
      </button>
    </form>
  )
}
