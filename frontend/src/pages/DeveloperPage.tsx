import { useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Spinner } from '@heroui/react'
import {
  createDeveloperGame,
  deleteDeveloperGame,
  getDeveloperGames,
  updateDeveloperGame,
} from '../api/developer'
import { getGenres } from '../api/games'
import type { AdminGameInput, Game, Genre } from '../types'

type GameFormState = {
  name: string
  description: string
  price: string
  releaseDate: string
  coverImageUrl: string
  genreIds: string[]
}

const emptyGameForm: GameFormState = {
  name: '',
  description: '',
  price: '0',
  releaseDate: '',
  coverImageUrl: '',
  genreIds: [],
}

function normalizeGameInput(form: GameFormState): AdminGameInput {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    developer_user_id: null,
    release_date: form.releaseDate || null,
    cover_image_url: form.coverImageUrl.trim() || null,
    genre_ids: form.genreIds.map(Number),
  }
}

function formatMoney(value: number) {
  return value === 0 ? 'Free' : `$${value.toFixed(2)}`
}

export default function DeveloperPage() {
  const [games, setGames] = useState<Game[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [gameForm, setGameForm] = useState<GameFormState>(emptyGameForm)
  const [editingGameId, setEditingGameId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadData() {
    setError('')
    try {
      const [gamesRes, genresRes] = await Promise.all([getDeveloperGames(), getGenres()])
      setGames(gamesRes.games)
      setGenres(genresRes.genres)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load developer data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadData)
  }, [])

  function resetForm() {
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
      releaseDate: game.release_date ? game.release_date.slice(0, 10) : '',
      coverImageUrl: game.cover_image_url ?? '',
      genreIds,
    })
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
        await updateDeveloperGame(editingGameId, input)
        setMessage('Game updated')
      } else {
        await createDeveloperGame(input)
        setMessage('Game created')
      }

      resetForm()
      await loadData()
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
      await deleteDeveloperGame(gameId)
      setMessage('Game deleted')
      if (editingGameId === gameId) resetForm()
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete game')
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
          <p className="admin-kicker">Studio tools</p>
          <h2 className="page-title">Developer Dashboard</h2>
        </div>
        <Button size="sm" variant="secondary" onPress={() => void loadData()}>
          Refresh
        </Button>
      </div>

      {error && <div className="checkout-alert checkout-alert--error">{error}</div>}
      {message && <div className="checkout-alert checkout-alert--success">{message}</div>}

      <Card className="admin-card">
        <Card.Header>
          <Card.Title>{editingGameId ? 'Edit Your Game' : 'Add Your Game'}</Card.Title>
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

            <label>
              Cover image URL
              <input
                value={gameForm.coverImageUrl}
                onChange={(event) => setGameForm((current) => ({ ...current, coverImageUrl: event.target.value }))}
              />
            </label>

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
                <Button type="button" variant="ghost" onPress={resetForm}>
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

      <section className="admin-section">
        <div className="admin-section-header">
          <h3>Your Games</h3>
          <span>{games.length} total</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Price</th>
                <th>Reviews</th>
                <th>Wishlist</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.game_id}>
                  <td>
                    <strong>{game.name}</strong>
                    <span>{game.genres?.join(', ') || 'No genre'}</span>
                  </td>
                  <td>{formatMoney(game.price)}</td>
                  <td>{game.review_count}</td>
                  <td>{game.wishlist_count}</td>
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
    </div>
  )
}
