import { useContext } from 'react'
import { CompareContext } from '../context/CompareContext'

export function useCompare() {
  const context = useContext(CompareContext)

  if (!context) {
    throw new Error('useCompare debe usarse dentro de un CompareProvider')
  }

  return {
    ...context,
    count: context.state.productIds.length,
    isComparing: (productId: string) => context.state.productIds.includes(productId),
  }
}
