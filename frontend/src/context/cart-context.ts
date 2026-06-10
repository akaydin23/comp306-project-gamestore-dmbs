import { createContext } from 'react'
import type { Game } from '../types'

export interface CartItem {
  game: Game
  added_at: string
}

export interface CartContextType {
  items: CartItem[]
  itemCount: number
  loading: boolean
  cartGameIds: Set<number>
  addToCart: (gameId: number) => Promise<void>
  removeFromCart: (gameId: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (gameId: number) => boolean
}

export const CartContext = createContext<CartContextType | null>(null)
