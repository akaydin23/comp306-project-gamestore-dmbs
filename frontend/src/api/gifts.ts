import { apiFetch } from './client'
import type { Gift } from '../types'

export function getReceivedGifts(): Promise<{ gifts: Gift[] }> {
  return apiFetch('/gifts')
}

export function getSentGifts(): Promise<{ gifts: Gift[] }> {
  return apiFetch('/gifts/sent')
}

export function sendGift(
  recipientUsername: string,
  gameId: number,
  giftMessage: string,
): Promise<{ gift: Gift }> {
  return apiFetch('/gifts', {
    method: 'POST',
    body: JSON.stringify({
      recipient_username: recipientUsername,
      game_id: gameId,
      gift_message: giftMessage,
    }),
  })
}

export function acceptGift(giftId: number): Promise<{ gift: Gift }> {
  return apiFetch(`/gifts/${giftId}/accept`, {
    method: 'POST',
  })
}

export function rejectGift(giftId: number): Promise<{ message: string }> {
  return apiFetch(`/gifts/${giftId}/reject`, {
    method: 'POST',
  })
}

export function cancelGift(giftId: number): Promise<{ message: string }> {
  return apiFetch(`/gifts/${giftId}/cancel`, {
    method: 'POST',
  })
}
