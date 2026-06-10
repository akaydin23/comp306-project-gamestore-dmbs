import { apiFetch } from './client'
import type { Game, LibraryEntry, Genre } from '../types'

export interface GetGamesParams {
  search?: string
  genre?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
}

export function getGames(params?: GetGamesParams): Promise<{ games: Game[] }> {
  const searchParams = new URLSearchParams()

  if (params?.search) searchParams.set('search', params.search)
  if (params?.genre) searchParams.set('genre', params.genre)
  if (params?.sort) searchParams.set('sort', params.sort)
  if (params?.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice))
  if (params?.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice))

  const qs = searchParams.toString()
  return apiFetch(`/games${qs ? `?${qs}` : ''}`)
}

export function getGenres(): Promise<{ genres: Genre[] }> {
  return apiFetch('/genres')
}

export function getGameById(gameId: number): Promise<{ game: Game }> {
  return apiFetch(`/games/${gameId}`)
}

export function getLibrary(): Promise<{ library: LibraryEntry[] }> {
  return apiFetch('/library')
}
