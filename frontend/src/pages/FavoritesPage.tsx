import { useEffect, useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard'
import { getFavorites } from '../api/favorites'
import { getWishlistIds } from '../api/wishlist'
import { getLibrary } from '../api/games'
import type { Game } from '../types'

export default function FavoritesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [ownedGameIds, setOwnedGameIds] = useState<Set<number>>(new Set())
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getFavorites(), getLibrary(), getWishlistIds()])
      .then(([favoritesRes, libraryRes, wishlistRes]) => {
        setGames(favoritesRes.games)
        setOwnedGameIds(new Set(libraryRes.library.map((entry) => entry.game.game_id)))
        setWishlistIds(new Set(wishlistRes.game_ids))
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load favorites'))
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
          <h2 className="page-title">Favorites</h2>
          <span className="text-sm text-muted">
            {games.length} favorite game{games.length !== 1 ? 's' : ''}
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
          <p className="empty-state-title">No favorites yet</p>
          <p className="empty-state-desc">Mark games as favorites to keep your top picks here.</p>
          <Link to="/store">
            <Button variant="secondary">Browse Store</Button>
          </Link>
        </div>
      )}

      {!error && games.length > 0 && (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard
              key={`${game.game_id}-favorite-${wishlistIds.has(game.game_id)}`}
              variant="store"
              game={game}
              isOwned={ownedGameIds.has(game.game_id)}
              initialWishlisted={wishlistIds.has(game.game_id)}
              initialFavorited
              onFavoriteChange={(gameId, favorited) => {
                if (!favorited) {
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
