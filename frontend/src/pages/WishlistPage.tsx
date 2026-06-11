import { useEffect, useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard'
import { getWishlist } from '../api/wishlist'
import type { Game } from '../types'

export default function WishlistPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getWishlist()
      .then((res) => setGames(res.games))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load wishlist'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="store-header">
        <div className="library-title-row">
          <h2 className="page-title">Wishlist</h2>
          <span className="text-sm text-muted">
            {games.length} saved game{games.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="empty-state">
          <p className="empty-state-title">Something went wrong</p>
          <p className="empty-state-desc">{error}</p>
        </div>
      )}

      {!error && games.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">Your wishlist is empty</p>
          <p className="empty-state-desc">Save games from the store to track them here.</p>
          <Link to="/store">
            <Button variant="secondary">Browse Store</Button>
          </Link>
        </div>
      )}

      {!error && games.length > 0 && (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game.game_id}
              variant="store"
              game={game}
              initialWishlisted
              onWishlistChange={(gameId, wishlisted) => {
                if (!wishlisted) {
                  setGames((prev) => prev.filter((item) => item.game_id !== gameId))
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
