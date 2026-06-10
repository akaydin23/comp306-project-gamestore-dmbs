import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Chip, Spinner } from '@heroui/react'
import { getGameById, getLibrary } from '../api/games'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import type { Game } from '../types'

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

function renderStars(rating: number | null) {
  if (rating === null) return <span className="text-sm text-muted">No ratings yet</span>
  const full = Math.round(rating)
  return (
    <span className="detail-stars">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      <span className="ml-1 text-sm text-muted">{rating.toFixed(1)}</span>
    </span>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPrice(price: number) {
  if (price === 0) return 'Free'
  return `$${price.toFixed(2)}`
}

export default function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isInCart, addToCart } = useCart()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ownedGameIds, setOwnedGameIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (isAuthenticated) {
      getLibrary()
        .then((res) => {
          setOwnedGameIds(new Set(res.library.map((e) => e.game.game_id)))
        })
        .catch(() => {})
    }
  }, [isAuthenticated])

  useEffect(() => {
    const id = Number(gameId)
    if (!Number.isInteger(id) || id <= 0) return

    getGameById(id)
      .then((res) => setGame(res.game))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load game'))
      .finally(() => setLoading(false))
  }, [gameId])

  if (!gameId || !Number.isInteger(Number(gameId)) || Number(gameId) <= 0) {
    return (
      <div className="page-content">
        <Button variant="secondary" size="sm" onPress={() => navigate('/')}>
          ← Back to Store
        </Button>
        <div className="empty-state">
          <p className="empty-state-title">Invalid game ID</p>
          <p className="empty-state-desc">The URL you entered is not valid.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="page-content">
        <Button variant="secondary" size="sm" onPress={() => navigate(-1)}>
          ← Back
        </Button>
        <div className="empty-state">
          <p className="empty-state-title">{error || 'Game not found'}</p>
          <p className="empty-state-desc">The game you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="page-content">
      <Button
        className="detail-back"
        size="sm"
        variant="secondary"
        onPress={() => navigate('/')}
      >
        ← Back to Store
      </Button>

      <Card className="detail-card">
        <div className={`detail-cover bg-gradient-to-br ${gradients[gradientIndex]}`}>
          <span className="detail-cover-letter">{game.name.charAt(0)}</span>
          {game.name.length > 1 && (
            <span className="detail-cover-letter detail-cover-letter--second">
              {game.name.charAt(1)}
            </span>
          )}
        </div>

        <Card.Content className="detail-body">
          <h1 className="detail-title">{game.name}</h1>

          <div className="detail-meta-top">
            {game.studio_name && (
              <span className="text-sm text-muted">By {game.studio_name}</span>
            )}
            {game.studio_name && game.release_date && (
              <span className="detail-sep" aria-hidden="true">·</span>
            )}
            {game.release_date && (
              <span className="text-sm text-muted">{formatDate(game.release_date)}</span>
            )}
          </div>

          <div className="detail-rating-row">
            {renderStars(game.average_rating)}
            <span className="text-sm text-muted">
              {game.review_count.toLocaleString()} review{game.review_count !== 1 ? 's' : ''}
            </span>
          </div>

          {genres.length > 0 && (
            <div className="detail-genres">
              {genres.map((genre) => (
                <Chip key={genre} className={`game-chip ${tagClass(genre)}`}>
                  {genre}
                </Chip>
              ))}
            </div>
          )}

          {game.description && (
            <p className="detail-description">{game.description}</p>
          )}

          <div className="detail-actions">
            {ownedGameIds.has(game.game_id) ? (
              <Button variant="secondary" className="ml-auto">
                Play
              </Button>
            ) : isInCart(game.game_id) ? (
              <Button variant="ghost" isDisabled>
                In Cart
              </Button>
            ) : (
              <>
                <span className="detail-price">{formatPrice(game.price)}</span>
                <Button
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
              </>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
