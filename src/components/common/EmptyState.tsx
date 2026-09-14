export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 py-20 text-center">
      <p className="text-sm text-ink/60">{message}</p>
    </div>
  )
}
