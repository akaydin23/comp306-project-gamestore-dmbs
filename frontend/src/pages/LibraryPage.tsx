import { useState, useEffect, useMemo } from 'react'
import { Label, SearchField, Spinner } from '@heroui/react'
import GameCard from '../components/GameCard'
import { getLibrary } from '../api/games'
import type { LibraryEntry } from '../types'

export default function LibraryPage() {
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getLibrary()
      .then((res) => setEntries(res.library))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load library'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter((e) => e.game.name.toLowerCase().includes(q))
  }, [entries, search])

  const totalHours = entries.reduce((sum, e) => sum + e.hours_played, 0)

  return (
    <div className="page-content">
      <div className="store-header">
        <div className="library-title-row">
          <h2 className="page-title">My Library</h2>
          <span className="text-sm text-muted">
            {entries.length} game{entries.length !== 1 ? 's' : ''} — {totalHours} hours played
          </span>
        </div>

        {entries.length > 0 && (
          <div className="filter-bar">
            <SearchField
              value={search}
              onChange={(v) => setSearch(v)}
              variant="secondary"
            >
              <Label className="sr-only">Search library</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="filter-search-input"
                  placeholder="Search your library..."
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>
        )}
      </div>

      {error && (
        <div className="empty-state">
          <p className="empty-state-title">Something went wrong</p>
          <p className="empty-state-desc">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">Your library is empty</p>
          <p className="empty-state-desc">Browse the store to find games to add to your collection.</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && entries.length > 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No games found</p>
          <p className="empty-state-desc">No games in your library match your search.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="game-grid">
          {filtered.map((entry) => (
            <GameCard
              key={entry.game.game_id}
              variant="library"
              game={entry.game}
              hoursPlayed={entry.hours_played}
              purchaseDate={entry.purchase_date}
            />
          ))}
        </div>
      )}
    </div>
  )
}
