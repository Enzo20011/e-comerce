import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
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
        placeholder="Buscar productos..."
        className="w-full rounded-full border border-ink/10 bg-surface/60 py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-accent"
      />
    </div>
  )
}
