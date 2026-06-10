import { apiFetch } from './client'
import type { Game } from '../types'

export interface CartItemResponse {
  game: Game
  added_at: string
}

export function getCart(): Promise<{ items: CartItemResponse[] }> {
  return apiFetch('/cart')
}

export function addToCart(gameId: number): Promise<{ message: string }> {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId }),
  })
}

export function removeFromCart(gameId: number): Promise<{ message: string }> {
  return apiFetch(`/cart/items/${gameId}`, {
    method: 'DELETE',
  })
}

export function clearCart(): Promise<{ message: string }> {
  return apiFetch('/cart', {
    method: 'DELETE',
  })
}
