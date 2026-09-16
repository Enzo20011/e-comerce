import { createContext, useEffect, useReducer, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { CompareAction, CompareState } from '../types/compare'

const STORAGE_KEY = 'ecomerce.compare'
export const MAX_COMPARE_ITEMS = 4

const initialState: CompareState = { productIds: [] }

function loadInitialState(): CompareState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { productIds: JSON.parse(raw) as string[] }
  } catch {
    return initialState
  }
}

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case 'TOGGLE_ITEM': {
      if (state.productIds.includes(action.productId)) {
        return { productIds: state.productIds.filter((id) => id !== action.productId) }
      }
      if (state.productIds.length >= MAX_COMPARE_ITEMS) {
        toast.error(`Podés comparar hasta ${MAX_COMPARE_ITEMS} productos a la vez.`)
        return state
      }
      return { productIds: [...state.productIds, action.productId] }
    }

    case 'REMOVE_ITEM':
      return { productIds: state.productIds.filter((id) => id !== action.productId) }

    case 'CLEAR_COMPARE':
      return { productIds: [] }

    default:
      return state
  }
}

interface CompareContextValue {
  state: CompareState
  toggleItem: (productId: string) => void
  removeItem: (productId: string) => void
  clearCompare: () => void
}

export const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.productIds))
    } catch {
      // almacenamiento no disponible
    }
  }, [state.productIds])

  const value: CompareContextValue = {
    state,
    toggleItem: (productId) => dispatch({ type: 'TOGGLE_ITEM', productId }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    clearCompare: () => dispatch({ type: 'CLEAR_COMPARE' }),
  }

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
