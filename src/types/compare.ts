export interface CompareState {
  productIds: string[]
}

export type CompareAction =
  | { type: 'TOGGLE_ITEM'; productId: string }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_COMPARE' }
