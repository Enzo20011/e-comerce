import { useState, type FormEvent } from 'react'
import type { ShippingDetails } from '../../types/order'

const EMPTY_FORM: ShippingDetails = { name: '', email: '', address: '', city: '', postalCode: '' }

const FIELDS: { name: keyof ShippingDetails; label: string; type: string }[] = [
  { name: 'name', label: 'Nombre y apellido', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Dirección', type: 'text' },
  { name: 'city', label: 'Ciudad', type: 'text' },
  { name: 'postalCode', label: 'Código postal', type: 'text' },
]

export function ShippingForm({ onSubmit }: { onSubmit: (details: ShippingDetails) => void }) {
  const [form, setForm] = useState<ShippingDetails>(EMPTY_FORM)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-ink/70">
            {field.label}
          </label>
          <input
            id={field.name}
            type={field.type}
            required
            value={form[field.name]}
            onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
      ))}

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper transition-colors hover:bg-accent"
      >
        Confirmar pedido
      </button>
    </form>
  )
}
