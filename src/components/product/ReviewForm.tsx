import { useState, type FormEvent } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { submitReview } from '../../data/reviewService'

const inputClass =
  'w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent'

export function ReviewForm({ productId }: { productId: string }) {
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await submitReview(productId, { author, rating, title, body })
      setSent(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos enviar tu reseña.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return <p className="mt-8 text-sm text-ink/70">Gracias. Tu reseña se publicará después de ser revisada.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex max-w-xl flex-col gap-3">
      <h3 className="font-display text-lg font-medium text-ink">Dejá tu reseña</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="Puntaje">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} estrellas`} onClick={() => setRating(value)}>
            <Star size={22} className={value <= rating ? 'fill-accent text-accent' : 'text-ink/20'} />
          </button>
        ))}
      </div>
      <input required minLength={2} maxLength={60} placeholder="Tu nombre" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
      <input required minLength={2} maxLength={100} placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      <textarea required minLength={5} maxLength={2000} rows={4} placeholder="Tu opinión" value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
      <button type="submit" disabled={submitting} className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-50">
        {submitting ? 'Enviando…' : 'Enviar reseña'}
      </button>
    </form>
  )
}
