import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button, Card, Spinner } from '@heroui/react'
import {
  createAdminGame,
  createAdminGenre,
  deleteAdminGame,
  deleteAdminGenre,
  getAdminPurchases,
  getAdminStats,
  getAdminUsers,
  updateAdminGame,
  updateAdminGenre,
} from '../api/admin'
import { getGames, getGenres } from '../api/games'
import type { AdminGameInput, AdminPurchase, AdminStats, AdminUser, Game, Genre } from '../types'

type GameFormState = {
  name: string
  description: string
  price: string
  developerUserId: string
  releaseDate: string
  coverImageUrl: string
  genreIds: string[]
}

const emptyGameForm: GameFormState = {
  name: '',
  description: '',
  price: '0',
  developerUserId: '',
  releaseDate: '',
  coverImageUrl: '',
  genreIds: [],
}

function formatMoney(value: number | string | null | undefined) {
  const numberValue = Number(value ?? 0)
  return `$${numberValue.toFixed(2)}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString()
}

function normalizeGameInput(form: GameFormState): AdminGameInput {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    developer_user_id: form.developerUserId ? Number(form.developerUserId) : null,
    release_date: form.releaseDate || null,
    cover_image_url: form.coverImageUrl.trim() || null,
    genre_ids: form.genreIds.map(Number),
  }
}

function purchaseItems(purchase: AdminPurchase) {
  if (Array.isArray(purchase.items)) return purchase.items

  return []
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [purchases, setPurchases] = useState<AdminPurchase[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingGameId, setEditingGameId] = useState<number | null>(null)
  const [gameForm, setGameForm] = useState<GameFormState>(emptyGameForm)
  const [genreName, setGenreName] = useState('')
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null)

  const developerOptions = useMemo(
    () => users.filter((user) => user.role === 'DEVELOPER' || user.role === 'ADMIN'),
    [users],
  )

  async function loadAdminData() {
    setError('')

    try {
      const [statsRes, usersRes, purchasesRes, gamesRes, genresRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminPurchases(),
        getGames(),
        getGenres(),
      ])

      setStats(statsRes.stats)
      setUsers(usersRes.users)
      setPurchases(purchasesRes.purchases)
      setGames(gamesRes.games)
      setGenres(genresRes.genres)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadAdminData)
  }, [])

  function resetGameForm() {
    setEditingGameId(null)
    setGameForm(emptyGameForm)
  }

  function startEditGame(game: Game) {
    const genreIds = genres
      .filter((genre) => game.genres?.includes(genre.genre_name))
      .map((genre) => String(genre.genre_id))

    setEditingGameId(game.game_id)
    setGameForm({
      name: game.name,
      description: game.description ?? '',
      price: String(game.price),
      developerUserId: game.developer_user_id ? String(game.developer_user_id) : '',
      releaseDate: game.release_date ? game.release_date.slice(0, 10) : '',
      coverImageUrl: game.cover_image_url ?? '',
      genreIds,
    })
  }

  async function handleSaveGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const input = normalizeGameInput(gameForm)

      if (!input.name) {
        throw new Error('Game name is required')
      }

      if (Number.isNaN(input.price) || input.price < 0) {
        throw new Error('Price must be zero or higher')
      }

      if (editingGameId) {
        await updateAdminGame(editingGameId, input)
        setMessage('Game updated')
      } else {
        await createAdminGame(input)
        setMessage('Game created')
      }

      resetGameForm()
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save game')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteGame(gameId: number) {
    setError('')
    setMessage('')

    try {
      await deleteAdminGame(gameId)
      setMessage('Game deleted')
      if (editingGameId === gameId) resetGameForm()
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete game')
    }
  }

  function toggleGenre(genreId: number) {
    const value = String(genreId)
    setGameForm((current) => ({
      ...current,
      genreIds: current.genreIds.includes(value)
        ? current.genreIds.filter((id) => id !== value)
        : [...current.genreIds, value],
    }))
  }

  async function handleSaveGenre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    const name = genreName.trim()
    if (!name) return

    try {
      if (editingGenreId) {
        await updateAdminGenre(editingGenreId, name)
        setMessage('Genre updated')
      } else {
        await createAdminGenre(name)
        setMessage('Genre created')
      }

      setGenreName('')
      setEditingGenreId(null)
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save genre')
    }
  }

  async function handleDeleteGenre(genreId: number) {
    setError('')
    setMessage('')

    try {
      await deleteAdminGenre(genreId)
      setMessage('Genre deleted')
      if (editingGenreId === genreId) {
        setEditingGenreId(null)
        setGenreName('')
      }
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete genre')
    }
  }

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="page-content admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-kicker">Control center</p>
          <h2 className="page-title">Admin Dashboard</h2>
        </div>
        <Button size="sm" variant="secondary" onPress={() => void loadAdminData()}>
          Refresh
        </Button>
      </div>

      {error && <div className="checkout-alert checkout-alert--error">{error}</div>}
      {message && <div className="checkout-alert checkout-alert--success">{message}</div>}

      {stats && (
        <section className="admin-stat-grid">
          <div className="stat-item">
            <p className="stat-label">Revenue</p>
            <p className="stat-value">{formatMoney(stats.total_revenue)}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Users</p>
            <p className="stat-value">{stats.user_count}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Games</p>
            <p className="stat-value">{stats.game_count}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Purchases</p>
            <p className="stat-value">{stats.purchase_count}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Reviews</p>
            <p className="stat-value">{stats.review_count}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Wishlist Saves</p>
            <p className="stat-value">{stats.wishlist_count}</p>
          </div>
        </section>
      )}

      <div className="admin-grid">
        <Card className="admin-card admin-card--wide">
          <Card.Header>
            <Card.Title>{editingGameId ? 'Edit Game' : 'Add Game'}</Card.Title>
          </Card.Header>
          <Card.Content>
            <form className="admin-form" onSubmit={handleSaveGame}>
              <label>
                Name
                <input
                  value={gameForm.name}
                  onChange={(event) => setGameForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>

              <label>
                Description
                <textarea
                  value={gameForm.description}
                  onChange={(event) => setGameForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>

              <div className="admin-form-row">
                <label>
                  Price
                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={gameForm.price}
                    onChange={(event) => setGameForm((current) => ({ ...current, price: event.target.value }))}
                  />
                </label>

                <label>
                  Release date
                  <input
                    type="date"
                    value={gameForm.releaseDate}
                    onChange={(event) => setGameForm((current) => ({ ...current, releaseDate: event.target.value }))}
                  />
                </label>
              </div>

              <div className="admin-form-row">
                <label>
                  Developer
                  <select
                    value={gameForm.developerUserId}
                    onChange={(event) => setGameForm((current) => ({ ...current, developerUserId: event.target.value }))}
                  >
                    <option value="">None</option>
                    {developerOptions.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username} #{user.user_id}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Cover image URL
                  <input
                    value={gameForm.coverImageUrl}
                    onChange={(event) => setGameForm((current) => ({ ...current, coverImageUrl: event.target.value }))}
                  />
                </label>
              </div>

              <div className="admin-genre-picker">
                {genres.map((genre) => (
                  <label key={genre.genre_id} className="admin-check">
                    <input
                      checked={gameForm.genreIds.includes(String(genre.genre_id))}
                      type="checkbox"
                      onChange={() => toggleGenre(genre.genre_id)}
                    />
                    {genre.genre_name}
                  </label>
                ))}
              </div>

              <div className="admin-actions">
                {editingGameId && (
                  <Button type="button" variant="ghost" onPress={resetGameForm}>
                    Cancel
                  </Button>
                )}
                <Button isPending={saving} type="submit">
                  {editingGameId ? 'Save Game' : 'Create Game'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>

        <Card className="admin-card">
          <Card.Header>
            <Card.Title>Genres</Card.Title>
          </Card.Header>
          <Card.Content>
            <form className="admin-genre-form" onSubmit={handleSaveGenre}>
              <input
                placeholder="Genre name"
                value={genreName}
                onChange={(event) => setGenreName(event.target.value)}
              />
              <Button isDisabled={!genreName.trim()} size="sm" type="submit">
                {editingGenreId ? 'Save' : 'Add'}
              </Button>
            </form>

            <div className="admin-genre-list">
              {genres.map((genre) => (
                <div key={genre.genre_id} className="admin-genre-row">
                  <span>{genre.genre_name}</span>
                  <div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setEditingGenreId(genre.genre_id)
                        setGenreName(genre.genre_name)
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onPress={() => void handleDeleteGenre(genre.genre_id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <h3>Games</h3>
          <span>{games.length} total</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Price</th>
                <th>Release</th>
                <th>Genres</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.game_id}>
                  <td>
                    <strong>{game.name}</strong>
                    <span>#{game.game_id}</span>
                  </td>
                  <td>{formatMoney(game.price)}</td>
                  <td>{formatDate(game.release_date)}</td>
                  <td>{game.genres?.join(', ') || 'No genre'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Button size="sm" variant="ghost" onPress={() => startEditGame(game)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onPress={() => void handleDeleteGame(game.game_id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="admin-grid">
        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Users</h3>
            <span>{users.length} accounts</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Library</th>
                  <th>Spent</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </td>
                    <td>
                      <span className={`role-badge role-badge--${user.role.toLowerCase()}`}>{user.role}</span>
                    </td>
                    <td>{user.library_count}</td>
                    <td>{formatMoney(user.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Top Games</h3>
            <span>By sales</span>
          </div>
          <div className="admin-top-list">
            {stats?.top_games.map((game) => (
              <div key={game.game_id} className="admin-top-row">
                <div>
                  <strong>{game.name}</strong>
                  <span>{game.purchase_count} purchases</span>
                </div>
                <b>{formatMoney(game.revenue)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <h3>Purchases</h3>
          <span>{purchases.length} orders</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.purchase_id}>
                  <td>
                    <strong>#{purchase.purchase_id}</strong>
                    <span>{formatDate(purchase.purchase_date)}</span>
                  </td>
                  <td>{purchase.username}</td>
                  <td>{purchaseItems(purchase).map((item) => item.name).join(', ') || `${purchase.item_count} item`}</td>
                  <td>{purchase.payment_method}</td>
                  <td>{formatMoney(purchase.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
