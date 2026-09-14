import { createContext, useEffect, useReducer, type ReactNode } from 'react'
import type { WishlistAction, WishlistState } from '../types/wishlist'

const STORAGE_KEY = 'ecomerce.wishlist'

const initialState: WishlistState = { productIds: [] }

function loadInitialState(): WishlistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { productIds: JSON.parse(raw) as string[] }
  } catch {
    return initialState
  }
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.productIds.includes(action.productId)) return state
      return { productIds: [...state.productIds, action.productId] }

    case 'REMOVE_ITEM':
      return { productIds: state.productIds.filter((id) => id !== action.productId) }

    case 'TOGGLE_ITEM':
      return state.productIds.includes(action.productId)
        ? { productIds: state.productIds.filter((id) => id !== action.productId) }
        : { productIds: [...state.productIds, action.productId] }

    case 'CLEAR_WISHLIST':
      return { productIds: [] }

    default:
      return state
  }
}

interface WishlistContextValue {
  state: WishlistState
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => void
  clearWishlist: () => void
}

export const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.productIds))
    } catch {
      // almacenamiento no disponible
    }
  }, [state.productIds])

  const value: WishlistContextValue = {
    state,
    addItem: (productId) => dispatch({ type: 'ADD_ITEM', productId }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    toggleItem: (productId) => dispatch({ type: 'TOGGLE_ITEM', productId }),
    clearWishlist: () => dispatch({ type: 'CLEAR_WISHLIST' }),
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
