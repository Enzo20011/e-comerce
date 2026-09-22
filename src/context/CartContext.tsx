import { createContext, useEffect, useReducer, type ReactNode } from 'react'
import type { CartAction, CartItem, CartState } from '../types/cart'
import type { Product } from '../types/product'

const STORAGE_KEY = 'ecomerce.cart'

const initialState: CartState = {
  items: [],
  isOpen: false,
}

function loadInitialState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, items: JSON.parse(raw) as CartItem[] }
  } catch {
    return initialState
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantity = action.quantity ?? 1
      const existing = state.items.find((item) => item.product.id === action.product.id)

      if (!existing) {
        return {
          ...state,
          items: [...state.items, { product: action.product, quantity }],
          isOpen: true,
        }
      }

      const nextQuantity = Math.min(existing.quantity + quantity, action.product.stock)
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.product.id ? { ...item, quantity: nextQuantity } : item,
        ),
        isOpen: true,
      }
    }

    case 'ADD_ITEM_SILENT': {
      // Same as ADD_ITEM but does NOT open the cart drawer
      const quantity = action.quantity ?? 1
      const existing = state.items.find((item) => item.product.id === action.product.id)
      if (!existing) {
        return { ...state, items: [...state.items, { product: action.product, quantity }] }
      }
      const nextQuantity = Math.min(existing.quantity + quantity, action.product.stock)
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.product.id ? { ...item, quantity: nextQuantity } : item,
        ),
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.productId),
      }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== action.productId),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: Math.min(action.quantity, item.product.stock) }
            : item,
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'HYDRATE_CART':
      return { ...state, items: action.items }

    default:
      return state
  }
}

interface CartContextValue {
  state: CartState
  addItem: (product: Product, quantity?: number) => void
  addItemSilent: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [state.items])

  const value: CartContextValue = {
    state,
    addItem: (product, quantity) => dispatch({ type: 'ADD_ITEM', product, quantity }),
    addItemSilent: (product, quantity) => dispatch({ type: 'ADD_ITEM_SILENT', product, quantity }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    updateQuantity: (productId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    openCart: () => dispatch({ type: 'OPEN_CART' }),
    closeCart: () => dispatch({ type: 'CLOSE_CART' }),
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
