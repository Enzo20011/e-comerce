import { ArrowDownUp } from 'lucide-react'
import { SORT_OPTIONS, type SortOption } from '../../hooks/useProductFilters'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative">
      <ArrowDownUp
        size={15}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="appearance-none rounded-full border border-ink/10 bg-surface/60 py-2.5 pl-9 pr-8 text-sm text-ink outline-none transition-colors focus:border-accent"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
