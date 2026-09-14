import { useContext, useMemo } from 'react'
import { CartContext } from '../context/CartContext'

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider')
  }

  const { state } = context

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  )

  const subtotal = useMemo(
    () => state.items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [state.items],
  )

  return { ...context, itemCount, subtotal }
}
