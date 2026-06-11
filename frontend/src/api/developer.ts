import { apiFetch } from './client'
import type { AdminGameInput, Game } from '../types'

export function getDeveloperGames(): Promise<{ games: Game[] }> {
  return apiFetch('/developer/games')
}

export function createDeveloperGame(input: AdminGameInput): Promise<{ game: Game }> {
  return apiFetch('/developer/games', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateDeveloperGame(gameId: number, input: AdminGameInput): Promise<{ game: Game }> {
  return apiFetch(`/developer/games/${gameId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteDeveloperGame(gameId: number): Promise<{ message: string }> {
  return apiFetch(`/developer/games/${gameId}`, {
    method: 'DELETE',
  })
}
