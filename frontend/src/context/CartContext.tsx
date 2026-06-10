import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import * as cartApi from '../api/cart'
import { CartContext, type CartItem } from './cart-context'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cartApi
      .getCart()
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cartGameIds = useMemo(
    () => new Set(items.map((i) => i.game.game_id)),
    [items],
  )

  const addToCart = useCallback(
    async (gameId: number) => {
      await cartApi.addToCart(gameId)
      cartApi
        .getCart()
        .then((res) => setItems(res.items))
        .catch(() => {})
    },
    [],
  )

  const removeFromCart = useCallback(
    async (gameId: number) => {
      await cartApi.removeFromCart(gameId)
      setItems((prev) => prev.filter((i) => i.game.game_id !== gameId))
    },
    [],
  )

  const clearCart = useCallback(async () => {
    await cartApi.clearCart()
    setItems([])
  }, [])

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
