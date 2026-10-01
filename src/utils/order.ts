export function generateOrderNumber(): string {
  const bytes = new Uint8Array(5)
  globalThis.crypto.getRandomValues(bytes)
  const random = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  return `ORD-${Date.now().toString(36).toUpperCase()}${random}`
}
