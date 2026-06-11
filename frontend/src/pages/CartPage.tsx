import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Chip, CloseButton, Spinner, toast } from '@heroui/react'
import { useCart } from '../context/useCart'
import { checkoutCart } from '../api/checkout'

const TAG_COLORS: Record<string, string> = {
  Action: 'bg-cyan-500/20 text-cyan-400',
  Adventure: 'bg-emerald-500/20 text-emerald-400',
  RPG: 'bg-violet-500/20 text-violet-400',
  Strategy: 'bg-amber-500/20 text-amber-400',
  Simulation: 'bg-sky-500/20 text-sky-400',
  Sports: 'bg-orange-500/20 text-orange-400',
  Racing: 'bg-red-500/20 text-red-400',
  Puzzle: 'bg-pink-500/20 text-pink-400',
  Horror: 'bg-rose-500/20 text-rose-400',
  Roguelike: 'bg-indigo-500/20 text-indigo-400',
  Dungeon: 'bg-yellow-500/20 text-yellow-400',
  Multiplayer: 'bg-blue-500/20 text-blue-400',
}

function tagClass(genre: string) {
  return TAG_COLORS[genre] ?? 'bg-zinc-500/20 text-zinc-400'
}

function formatPrice(price: number) {
  if (price === 0) return 'Free'
  return `$${price.toFixed(2)}`
}

function coverGradient(id: number) {
  const g = [
    'from-violet-600 via-purple-600 to-indigo-700',
    'from-cyan-500 via-blue-500 to-indigo-600',
    'from-emerald-500 via-teal-500 to-cyan-600',
    'from-amber-500 via-orange-500 to-red-600',
    'from-rose-500 via-pink-500 to-fuchsia-600',
    'from-blue-500 via-indigo-500 to-violet-600',
  ]
  return g[id % 6]
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, loading, removeFromCart, clearCart } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutError, setCheckoutError] = useState('')

  const subtotal = items.reduce((sum, i) => sum + i.game.price, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  async function handleCheckout() {
    setCheckoutMessage('')
    setCheckoutError('')
    setCheckingOut(true)

    try {
      const res = await checkoutCart()
      await clearCart()
      toast.success('Purchase completed!', {
        description: `Order #${res.purchase.purchase_id} — ${formatPrice(res.purchase.total_price)}`,
      })
      navigate('/library')
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-content">
        <div className="cart-empty-hero">
          <div className="cart-empty-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-desc">Looks like you haven&apos;t added anything yet.</p>
          <Link to="/store">
            <Button variant="secondary" size="lg">Browse Games</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <h2 className="page-title cart-page-title">
        Shopping Cart
        <span className="cart-item-count">{items.length}</span>
      </h2>

      <div className="cart-layout">
        <div className="cart-main">
          {items.map((item, idx) => (
            <Card key={item.game.game_id} className="cart-card" style={{ animationDelay: `${idx * 0.05}s` }}>
              <CloseButton
                aria-label={`Remove ${item.game.name} from cart`}
                className="cart-card-remove"
                onPress={() => removeFromCart(item.game.game_id)}
              />

              <Link to={`/store/${item.game.game_id}`} className="cart-card-cover-link">
                <div className={`cart-card-cover bg-gradient-to-br ${coverGradient(item.game.game_id)}`}>
                  <span className="cart-card-cover-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="3" width="15" height="18" rx="2" ry="2"/>
                    </svg>
                  </span>
                </div>
              </Link>

              <Card.Content className="cart-card-body">
                <div className="cart-card-info">
                  <Link to={`/store/${item.game.game_id}`} className="cart-card-title">
                    {item.game.name}
                  </Link>

                  {item.game.studio_name && (
                    <p className="cart-card-dev">{item.game.studio_name}</p>
                  )}

                  <div className="cart-card-genres">
                    {(item.game.genres ?? []).map((genre) => (
                      <Chip key={genre} className={`game-chip ${tagClass(genre)}`}>
                        {genre}
                      </Chip>
                    ))}
                  </div>

                  {item.game.description && (
                    <p className="cart-card-desc">{item.game.description}</p>
                  )}
                </div>

                <div className="cart-card-price-col">
                  <span className="cart-card-price">{formatPrice(item.game.price)}</span>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        <aside className="cart-sidebar">
          <Card className="cart-summary-card">
            <Card.Header>
              <Card.Title>Order Summary</Card.Title>
            </Card.Header>
            <Card.Content className="cart-summary-body">
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span className="cart-summary-value">{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span className="cart-summary-label">Estimated tax</span>
                <span className="cart-summary-value">{formatPrice(tax)}</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-total">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-value">{formatPrice(total)}</span>
              </div>
            </Card.Content>
            <Card.Footer className="cart-summary-footer">
              {checkoutError && <div className="checkout-alert checkout-alert--error">{checkoutError}</div>}
              {checkoutMessage && <div className="checkout-alert checkout-alert--success">{checkoutMessage}</div>}
              <Button
                className="w-full"
                isPending={checkingOut}
                size="lg"
                onPress={handleCheckout}
              >
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
              <Button
                className="w-full"
                size="sm"
                variant="ghost"
                onPress={() => clearCart()}
              >
                Clear Cart
              </Button>
            </Card.Footer>
          </Card>

          <div className="cart-secure-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Secure checkout</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
