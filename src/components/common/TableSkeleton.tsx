import { Skeleton } from './Skeleton'

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
      <div className="divide-y divide-ink/10">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-6 px-4 py-4">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={colIndex} className={`h-4 ${colIndex === 0 ? 'w-1/4' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
