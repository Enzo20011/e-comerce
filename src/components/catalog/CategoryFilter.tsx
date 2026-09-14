import { ALL_CATEGORIES } from '../../hooks/useProductFilters'

interface CategoryFilterProps {
  categories: readonly string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const options = [ALL_CATEGORIES, ...categories]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((category) => {
        const isActive = category === selected
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-accent bg-accent text-on-accent'
                : 'border-ink/10 text-ink/70 hover:border-accent hover:text-accent'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
