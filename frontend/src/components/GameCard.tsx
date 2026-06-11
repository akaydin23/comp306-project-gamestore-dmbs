import { Card, Chip, Button } from '@heroui/react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { addToWishlist, removeFromWishlist } from '../api/wishlist'
import type { Game } from '../types'
import { useState } from 'react'

type GameCardProps =
  | {
      variant: 'store'
      game: Game
      isOwned?: boolean
      initialWishlisted?: boolean
      onWishlistChange?: (gameId: number, wishlisted: boolean) => void
    }
  | { variant: 'library'; game: Game; hoursPlayed: number; purchaseDate: string | null }

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

const DEFAULT_TAG = 'bg-zinc-500/20 text-zinc-400'

function getTagClass(genre: string) {
  return TAG_COLORS[genre] ?? DEFAULT_TAG
}

function renderStars(rating: number | null) {
  if (rating === null) return <span className="text-xs text-muted">No ratings</span>
  const full = Math.round(rating)
  return (
    <span className="game-stars">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      <span className="ml-1 text-xs text-muted">{rating.toFixed(1)}</span>
    </span>
  )
}

function formatPrice(price: number) {
  if (price === 0) return 'Free'
  return `$${price.toFixed(2)}`
}

export default function GameCard(props: GameCardProps) {
  const { game, variant } = props
  const { isAuthenticated } = useAuth()
  const { isInCart, addToCart } = useCart()
  const navigate = useNavigate()
  const [wishlisted, setWishlisted] = useState(
    variant === 'store' ? Boolean(props.initialWishlisted) : false,
  )
  const [wishlistBusy, setWishlistBusy] = useState(false)

  const gradientIndex = game.game_id % 6
  const gradients = [
    'from-violet-600 to-indigo-700',
    'from-cyan-600 to-blue-700',
    'from-emerald-600 to-teal-700',
    'from-amber-600 to-orange-700',
    'from-rose-600 to-pink-700',
    'from-blue-600 to-purple-700',
  ]

  const genres = game.genres ?? []
  const inCart = isInCart(game.game_id)

  async function toggleWishlist() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setWishlistBusy(true)
    try {
      if (wishlisted) {
        await removeFromWishlist(game.game_id)
        setWishlisted(false)
        if (props.variant === 'store') {
          props.onWishlistChange?.(game.game_id, false)
        }
      } else {
        await addToWishlist(game.game_id)
        setWishlisted(true)
        if (props.variant === 'store') {
          props.onWishlistChange?.(game.game_id, true)
        }
      }
    } finally {
      setWishlistBusy(false)
    }
  }

  return (
    <Card className="game-card">
      <Link to={`/store/${game.game_id}`} className="game-card-cover-link">
        <div className={`game-card-cover bg-gradient-to-br ${gradients[gradientIndex]}`}>
          <span className="game-card-cover-text">{game.name.charAt(0)}</span>
        </div>
      </Link>

      <Card.Content className="game-card-content">
        <Link to={`/store/${game.game_id}`} className="game-card-title">
          {game.name}
        </Link>

        <div className="game-card-genres">
          {genres.slice(0, 3).map((genre) => (
            <Chip key={genre} className={`game-chip ${getTagClass(genre)}`}>
              {genre}
            </Chip>
          ))}
        </div>

        <div className="game-card-meta">
          {renderStars(game.average_rating)}
          <span className="text-xs text-muted">{game.review_count.toLocaleString()} reviews</span>
        </div>

        {variant === 'store' ? (
          <div className="game-card-actions">
            <span className="game-card-price">
              {formatPrice(game.price)}
            </span>
              <div className="game-card-action-buttons">
                <Button
                  className="game-card-wishlist-btn"
                  isDisabled={wishlistBusy}
                  size="sm"
                  variant={wishlisted ? 'secondary' : 'ghost'}
                  onPress={toggleWishlist}
                >
                  {wishlisted ? 'Saved' : 'Wishlist'}
                </Button>
                {props.isOwned ? (
                  <Button className="game-card-cart-btn" size="sm" variant="ghost" isDisabled>
                    In Library
                  </Button>
                ) : inCart ? (
                  <Button className="game-card-cart-btn" size="sm" variant="ghost" isDisabled>
                    In Cart
                  </Button>
                ) : (
                  <Button
                    className="game-card-cart-btn"
                    size="sm"
                    variant="secondary"
                    onPress={() => {
                      if (isAuthenticated) {
                        addToCart(game.game_id)
                      } else {
                        navigate('/login')
                      }
                    }}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
          </div>
        ) : (
          <div className="game-card-actions">
            <div className="game-library-info">
              <span className="text-xs text-muted">Played {props.hoursPlayed} hrs</span>
              <span className="text-xs text-muted">
                {props.purchaseDate
                  ? `Since ${new Date(props.purchaseDate).toLocaleDateString()}`
                  : 'Added to library'}
              </span>
            </div>
            <Button className="game-card-play-btn" size="sm">
              Play
            </Button>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
