import { useState, useEffect, useCallback, useRef } from 'react'
import { Label, ListBox, SearchField, Select, Spinner } from '@heroui/react'
import GameCard from '../components/GameCard'
import { getGames, getGenres } from '../api/games'
import type { Game, Genre } from '../types'

const SORT_OPTIONS = [
  { key: 'release_desc', label: 'Newest' },
  { key: 'rating_desc', label: 'Highest Rated' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name_asc', label: 'Name: A to Z' },
]

export default function StorePage() {
  const [games, setGames] = useState<Game[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState<string | null>(null)
  const [sort, setSort] = useState<string>('release_desc')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getGames({
        search: search || undefined,
        genre: genre ?? undefined,
        sort,
      })
      setGames(res.games)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }, [search, genre, sort])

  useEffect(() => {
    getGenres().then((res) => setGenres(res.genres)).catch(() => {})
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchGames, 300)
    return () => clearTimeout(debounceRef.current)
  }, [fetchGames])

  return (
    <div className="page-content">
      <div className="store-header">
        <h2 className="page-title">Browse Games</h2>

        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={(v) => setSearch(v)}
            variant="secondary"
          >
            <Label className="sr-only">Search games</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                className="filter-search-input"
                placeholder="Search games..."
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <Select
            className="filter-select"
            placeholder="All Genres"
            variant="secondary"
            value={genre}
            onChange={(v) => setGenre(v as string | null)}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {genres.map((g) => (
                  <ListBox.Item key={g.genre_name} id={g.genre_name} textValue={g.genre_name}>
                    {g.genre_name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Select
            className="filter-select"
            placeholder="Sort by"
            variant="secondary"
            value={sort}
            onChange={(v) => setSort(v as string)}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {SORT_OPTIONS.map((opt) => (
                  <ListBox.Item key={opt.key} id={opt.key} textValue={opt.label}>
                    {opt.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
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

      {!loading && !error && games.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No games found</p>
          <p className="empty-state-desc">Try adjusting your search or filters.</p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard key={game.game_id} variant="store" game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
