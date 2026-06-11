import { apiFetch } from './client'
import type { Review } from '../types'

export function getGameReviews(gameId: number): Promise<{ reviews: Review[] }> {
  return apiFetch(`/reviews/games/${gameId}`)
}

export function saveReview(
  gameId: number,
  rating: number,
  comment: string,
): Promise<{ review: Review }> {
  return apiFetch(`/reviews/games/${gameId}/me`, {
    method: 'PUT',
    body: JSON.stringify({ rating, comment }),
  })
}

export function deleteReview(gameId: number): Promise<{ message: string }> {
  return apiFetch(`/reviews/games/${gameId}/me`, {
    method: 'DELETE',
  })
}
