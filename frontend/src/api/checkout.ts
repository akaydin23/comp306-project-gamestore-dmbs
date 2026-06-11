import { apiFetch } from './client'
import type { CheckoutResult } from '../types'

export function checkoutCart(): Promise<{ purchase: CheckoutResult }> {
  return apiFetch('/checkout', {
    method: 'POST',
  })
}
