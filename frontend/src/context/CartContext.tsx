import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import * as cartApi from '../api/cart'
import { CartContext, type CartItem } from './cart-context'
import { useAuth } from './useAuth'

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    cartApi
      .getCart()
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const cartGameIds = useMemo(
    () => new Set(items.map((i) => i.game.game_id)),
    [items],
  )

  const addToCart = useCallback(
    async (gameId: number) => {
      if (!isAuthenticated) return
      await cartApi.addToCart(gameId)
      cartApi
        .getCart()
        .then((res) => setItems(res.items))
        .catch(() => {})
    },
    [isAuthenticated],
  )

  const removeFromCart = useCallback(
    async (gameId: number) => {
      if (!isAuthenticated) return
      await cartApi.removeFromCart(gameId)
      setItems((prev) => prev.filter((i) => i.game.game_id !== gameId))
    },
    [isAuthenticated],
  )

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return
    await cartApi.clearCart()
    setItems([])
  }, [isAuthenticated])

  const isInCart = useCallback(
    (gameId: number) => cartGameIds.has(gameId),
    [cartGameIds],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        loading,
        cartGameIds,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
