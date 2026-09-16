import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { subscribeToNewsletter } from '../../data/newsletterService'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    try {
      await subscribeToNewsletter(email.trim())
      setSubmitted(true)
      setEmail('')
    } catch {
      toast.error('No pudimos completar la suscripción. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
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
        disabled={submitting}
        className="flex-none rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-all duration-150 hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        {submitting ? '…' : 'Sumarme'}
      </button>
    </form>
  )
}
