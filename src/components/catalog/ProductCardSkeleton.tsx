import { Skeleton } from '../common/Skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-surface/50">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  )
}
