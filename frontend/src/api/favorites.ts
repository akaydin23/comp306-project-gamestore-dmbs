import { apiFetch } from './client'
import type { Game } from '../types'

export function getFavorites(): Promise<{ games: Game[] }> {
  return apiFetch('/favorites')
}

export function getFavoriteIds(): Promise<{ game_ids: number[] }> {
  return apiFetch('/favorites/ids')
}

export function addToFavorites(gameId: number): Promise<{ message: string }> {
  return apiFetch('/favorites/items', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId }),
  })
}

export function removeFromFavorites(gameId: number): Promise<{ message: string }> {
  return apiFetch(`/favorites/items/${gameId}`, {
    method: 'DELETE',
  })
}
