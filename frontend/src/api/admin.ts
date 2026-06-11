import { apiFetch } from './client'
import type {
  AdminGameInput,
  AdminPurchase,
  AdminStats,
  AdminUser,
  Game,
  Genre,
} from '../types'

export function getAdminStats(): Promise<{ stats: AdminStats }> {
  return apiFetch('/admin/stats')
}

export function getAdminUsers(): Promise<{ users: AdminUser[] }> {
  return apiFetch('/admin/users')
}

export function getAdminPurchases(): Promise<{ purchases: AdminPurchase[] }> {
  return apiFetch('/admin/purchases')
}

export function createAdminGame(input: AdminGameInput): Promise<{ game: Game }> {
  return apiFetch('/admin/games', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateAdminGame(gameId: number, input: AdminGameInput): Promise<{ game: Game }> {
  return apiFetch(`/admin/games/${gameId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteAdminGame(gameId: number): Promise<{ message: string }> {
  return apiFetch(`/admin/games/${gameId}`, {
    method: 'DELETE',
  })
}

export function createAdminGenre(name: string): Promise<{ genre: Genre }> {
  return apiFetch('/admin/genres', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function updateAdminGenre(genreId: number, name: string): Promise<{ genre: Genre }> {
  return apiFetch(`/admin/genres/${genreId}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export function deleteAdminGenre(genreId: number): Promise<{ message: string }> {
  return apiFetch(`/admin/genres/${genreId}`, {
    method: 'DELETE',
  })
}
