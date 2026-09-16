import { useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  suggestions?: Product[]
}

export function SearchBar({ value, onChange, suggestions = [] }: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const showSuggestions = focused && value.trim() !== '' && suggestions.length > 0

  return (
    <div className="relative w-full">
      <Search
        size={18}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder="Buscar productos..."
        className="w-full rounded-full border border-ink/10 bg-surface/60 py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-accent"
      />

      {showSuggestions && (
        <div className="animate-rise-in absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-xl shadow-ink/10">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:bg-ink/5"
            >
              <img src={product.image} alt="" className="h-10 w-10 flex-none rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                <p className="text-xs text-ink/50">{product.category}</p>
              </div>
              <span className="flex-none text-sm font-semibold text-ink">
                {currency.format(product.price)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
