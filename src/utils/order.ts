export function generateOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}
