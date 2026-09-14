export interface WishlistState {
  productIds: string[]
}

export type WishlistAction =
  | { type: 'ADD_ITEM'; productId: string }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'TOGGLE_ITEM'; productId: string }
  | { type: 'CLEAR_WISHLIST' }
