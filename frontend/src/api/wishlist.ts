import { apiFetch } from './client'
import type { Game } from '../types'

export function getWishlist(): Promise<{ games: Game[] }> {
  return apiFetch('/wishlist')
}

export function getWishlistIds(): Promise<{ game_ids: number[] }> {
  return apiFetch('/wishlist/ids')
}

export function addToWishlist(gameId: number): Promise<{ message: string }> {
  return apiFetch('/wishlist/items', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId }),
  })
}

export function removeFromWishlist(gameId: number): Promise<{ message: string }> {
  return apiFetch(`/wishlist/items/${gameId}`, {
    method: 'DELETE',
  })
}
