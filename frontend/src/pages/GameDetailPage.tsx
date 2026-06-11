import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Chip, Spinner } from '@heroui/react'
import { getGameById, getLibrary } from '../api/games'
import { getWishlistIds, addToWishlist, removeFromWishlist } from '../api/wishlist'
import { getFavoriteIds, addToFavorites, removeFromFavorites } from '../api/favorites'
import { deleteReview, getGameReviews, saveReview } from '../api/reviews'
import { sendGift } from '../api/gifts'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import type { Game, Review } from '../types'

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
  const { isAuthenticated, user } = useAuth()
  const { isInCart, addToCart } = useCart()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ownedGameIds, setOwnedGameIds] = useState<Set<number>>(new Set())
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [wishlistBusy, setWishlistBusy] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [giftRecipient, setGiftRecipient] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [giftNotice, setGiftNotice] = useState('')
  const [giftError, setGiftError] = useState('')
  const [sendingGift, setSendingGift] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([getLibrary(), getWishlistIds(), getFavoriteIds()])
        .then(([libraryRes, wishlistRes, favoriteRes]) => {
          setOwnedGameIds(new Set(libraryRes.library.map((e) => e.game.game_id)))
          setWishlistIds(new Set(wishlistRes.game_ids))
          setFavoriteIds(new Set(favoriteRes.game_ids))
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

    getGameReviews(id)
      .then((res) => {
        setReviews(res.reviews)
        const own = res.reviews.find((review) => review.user_id === user?.user_id)
        if (own) {
          setReviewRating(own.rating)
          setReviewComment(own.comment ?? '')
        }
      })
      .catch(() => {})
  }, [gameId, user?.user_id])

  if (!gameId || !Number.isInteger(Number(gameId)) || Number(gameId) <= 0) {
    return (
      <div className="page-content">
        <Button variant="secondary" size="sm" onPress={() => navigate('/store')}>
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

  const currentGame = game
  const gradientIndex = currentGame.game_id % 6
  const gradients = [
    'from-violet-600 to-indigo-700',
    'from-cyan-600 to-blue-700',
    'from-emerald-600 to-teal-700',
    'from-amber-600 to-orange-700',
    'from-rose-600 to-pink-700',
    'from-blue-600 to-purple-700',
  ]

  const genres = currentGame.genres ?? []
  const ownsGame = ownedGameIds.has(currentGame.game_id)
  const isWishlisted = wishlistIds.has(currentGame.game_id)
  const isFavorited = favoriteIds.has(currentGame.game_id)
  const ownReview = reviews.find((review) => review.user_id === user?.user_id)

  async function toggleWishlist() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setWishlistBusy(true)
    try {
      if (isWishlisted) {
        await removeFromWishlist(currentGame.game_id)
        setWishlistIds((prev) => {
          const next = new Set(prev)
          next.delete(currentGame.game_id)
          return next
        })
      } else {
        await addToWishlist(currentGame.game_id)
        setWishlistIds((prev) => new Set(prev).add(currentGame.game_id))
      }
    } finally {
      setWishlistBusy(false)
    }
  }

  async function toggleFavorite() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setFavoriteBusy(true)
    try {
      if (isFavorited) {
        await removeFromFavorites(currentGame.game_id)
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(currentGame.game_id)
          return next
        })
      } else {
        await addToFavorites(currentGame.game_id)
        setFavoriteIds((prev) => new Set(prev).add(currentGame.game_id))
      }
    } finally {
      setFavoriteBusy(false)
    }
  }

  async function handleSendGift() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setGiftNotice('')
    setGiftError('')
    setSendingGift(true)

    try {
      await sendGift(giftRecipient.trim(), currentGame.game_id, giftMessage)
      setGiftRecipient('')
      setGiftMessage('')
      setGiftNotice('Gift sent')
    } catch (err) {
      setGiftError(err instanceof Error ? err.message : 'Could not send gift')
    } finally {
      setSendingGift(false)
    }
  }

  async function handleSaveReview() {
    setReviewMessage('')
    setReviewError('')
    setSavingReview(true)

    try {
      await saveReview(currentGame.game_id, reviewRating, reviewComment)
      const [reviewsRes, gameRes] = await Promise.all([
        getGameReviews(currentGame.game_id),
        getGameById(currentGame.game_id),
      ])
      setReviews(reviewsRes.reviews)
      setGame(gameRes.game)
      setReviewMessage('Review saved')
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Could not save review')
    } finally {
      setSavingReview(false)
    }
  }

  async function handleDeleteReview() {
    setReviewMessage('')
    setReviewError('')
    setSavingReview(true)

    try {
      await deleteReview(currentGame.game_id)
      const [reviewsRes, gameRes] = await Promise.all([
        getGameReviews(currentGame.game_id),
        getGameById(currentGame.game_id),
      ])
      setReviews(reviewsRes.reviews)
      setGame(gameRes.game)
      setReviewComment('')
      setReviewRating(5)
      setReviewMessage('Review deleted')
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Could not delete review')
    } finally {
      setSavingReview(false)
    }
  }

  return (
    <div className="page-content">
      <Button
        className="detail-back"
        size="sm"
        variant="secondary"
        onPress={() => navigate('/store')}
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
            {!ownsGame && (
              <Button
                isDisabled={wishlistBusy}
                variant={isWishlisted ? 'secondary' : 'ghost'}
                onPress={toggleWishlist}
              >
                {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </Button>
            )}
            <Button
              isDisabled={favoriteBusy}
              variant={isFavorited ? 'secondary' : 'ghost'}
              onPress={toggleFavorite}
            >
              {isFavorited ? 'Favorited' : 'Favorite'}
            </Button>

            {ownsGame ? (
              <Button variant="secondary" className="ml-auto" onPress={() => navigate(`/play/${game.game_id}`)}>
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

      <Card className="reviews-card">
        <Card.Header>
          <Card.Title>Gift This Game</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="review-form">
            <div className="review-form-header">
              <h3>Send to a player</h3>
            </div>
            <input
              placeholder="Recipient username"
              value={giftRecipient}
              onChange={(event) => setGiftRecipient(event.target.value)}
            />
            <textarea
              placeholder="Optional message"
              value={giftMessage}
              onChange={(event) => setGiftMessage(event.target.value)}
            />
            {giftError && <div className="checkout-alert checkout-alert--error">{giftError}</div>}
            {giftNotice && <div className="checkout-alert checkout-alert--success">{giftNotice}</div>}
            <div className="review-form-actions">
              <Button
                isDisabled={!giftRecipient.trim()}
                isPending={sendingGift}
                size="sm"
                variant="secondary"
                onPress={handleSendGift}
              >
                Send Gift
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card className="reviews-card">
        <Card.Header>
          <Card.Title>Reviews</Card.Title>
        </Card.Header>
        <Card.Content className="reviews-content">
          {isAuthenticated && ownsGame && (
            <div className="review-form">
              <div className="review-form-header">
                <h3>{ownReview ? 'Update your review' : 'Write a review'}</h3>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} star{rating !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="What did you think about this game?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              {reviewError && <div className="checkout-alert checkout-alert--error">{reviewError}</div>}
              {reviewMessage && <div className="checkout-alert checkout-alert--success">{reviewMessage}</div>}
              <div className="review-form-actions">
                {ownReview && (
                  <Button
                    isDisabled={savingReview}
                    size="sm"
                    variant="danger"
                    onPress={handleDeleteReview}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  isPending={savingReview}
                  size="sm"
                  variant="secondary"
                  onPress={handleSaveReview}
                >
                  Save Review
                </Button>
              </div>
            </div>
          )}

          {isAuthenticated && !ownsGame && (
            <p className="reviews-note">Buy this game to write a review.</p>
          )}

          {!isAuthenticated && (
            <p className="reviews-note">Sign in to review games you own.</p>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="reviews-note">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div className="review-item" key={review.review_id}>
                  <div className="review-item-header">
                    <strong>{review.username}</strong>
                    <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
