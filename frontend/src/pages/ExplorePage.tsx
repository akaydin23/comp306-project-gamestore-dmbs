import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import GameCard from '../components/GameCard'
import type { Game } from '../types'

interface SearchFilters {
  searchQuery: string
  studioQuery: string
  startDate: string
  endDate: string
  minPrice: number
  maxPrice: number
  isFree: boolean
  minRating: number
  excludeOwned: boolean
  includeWishlistedOnly: boolean
  sortBy: 'release_desc' | 'release_asc' | 'price_asc' | 'price_desc' | 'rating_desc'
}

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  searchQuery: '',
  studioQuery: '',
  startDate: '',
  endDate: '',
  minPrice: 0,
  maxPrice: 100,
  isFree: false,
  minRating: 0,
  excludeOwned: false,
  includeWishlistedOnly: false,
  sortBy: 'release_desc',
}

export default function ExplorePage() {
  const { isAuthenticated } = useAuth()
  
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS)

  const [activeSqlExplanation, setActiveSqlExplanation] = useState<string>('Select a filter to view SQL translation.')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  const executeDatabaseQuery = useCallback(async (currentFilters: SearchFilters) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const queryParams = new URLSearchParams()
      
      if (currentFilters.searchQuery) queryParams.append('q', currentFilters.searchQuery)
      if (currentFilters.studioQuery) queryParams.append('studio', currentFilters.studioQuery)
      if (currentFilters.startDate) queryParams.append('startDate', currentFilters.startDate)
      if (currentFilters.endDate) queryParams.append('endDate', currentFilters.endDate)
      
      if (currentFilters.isFree) {
        queryParams.append('maxPrice', '0')
      } else {
        queryParams.append('minPrice', currentFilters.minPrice.toString())
        queryParams.append('maxPrice', currentFilters.maxPrice.toString())
      }
      
      if (currentFilters.minRating > 0) queryParams.append('minRating', currentFilters.minRating.toString())
      if (currentFilters.excludeOwned && isAuthenticated) queryParams.append('excludeOwned', 'true')
      if (currentFilters.includeWishlistedOnly && isAuthenticated) queryParams.append('wishlistOnly', 'true')
      queryParams.append('sort', currentFilters.sortBy)

      const response = await fetch(`${API_URL}/games/search?${queryParams.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to retrieve search results.')
      }

      const matchingGames = (await response.json()) as Game[]
      setGames(matchingGames)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [API_URL, isAuthenticated])

  useEffect(() => {
    void Promise.resolve().then(() => executeDatabaseQuery(DEFAULT_SEARCH_FILTERS))
  }, [executeDatabaseQuery])

  const handleFilterUpdate = (updatedFields: Partial<SearchFilters>) => {
    const nextFilters = { ...filters, ...updatedFields }
    setFilters(nextFilters)

    if (updatedFields.studioQuery !== undefined) {
      setActiveSqlExplanation(
        `SELECT g.*, dp.studio_name \nFROM Games g\nLEFT JOIN DeveloperProfiles dp ON g.developer_user_id = dp.user_id\nWHERE dp.studio_name ILIKE '%${updatedFields.studioQuery}%';`
      )
    } else if (updatedFields.startDate !== undefined || updatedFields.endDate !== undefined) {
      setActiveSqlExplanation(
        `SELECT * FROM Games \nWHERE release_date >= '${nextFilters.startDate || '1970-01-01'}'::DATE \n  AND release_date <= '${nextFilters.endDate || '2026-12-31'}'::DATE;`
      )
    } else if (updatedFields.minRating !== undefined) {
      setActiveSqlExplanation(
        `SELECT g.*, AVG(r.rating) as average_rating \nFROM Games g\nLEFT JOIN Reviews r ON g.game_id = r.game_id\nGROUP BY g.game_id\nHAVING COALESCE(AVG(r.rating), 0) >= ${updatedFields.minRating};`
      )
    } else if (updatedFields.excludeOwned !== undefined) {
      setActiveSqlExplanation(
        `SELECT * FROM Games g\nWHERE NOT EXISTS (\n  SELECT 1 FROM Library l \n  WHERE l.game_id = g.game_id AND l.user_id = CURRENT_USER_ID\n);`
      )
    } else if (updatedFields.searchQuery !== undefined) {
      setActiveSqlExplanation(
        `SELECT * FROM Games \nWHERE LOWER(name) LIKE LOWER('%${updatedFields.searchQuery}%');`
      )
    }

    executeDatabaseQuery(nextFilters)
  }

  const resetFilters = () => {
    const baseFilters: SearchFilters = DEFAULT_SEARCH_FILTERS
    setFilters(baseFilters)
    setActiveSqlExplanation('SELECT * FROM Games ORDER BY release_date DESC;')
    executeDatabaseQuery(baseFilters)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Advanced Search Engine
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs uppercase font-black tracking-widest text-zinc-400">Filters</h3>
                <button onClick={resetFilters} className="text-xs text-blue-400 hover:text-blue-300 transition underline">
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterUpdate({ searchQuery: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Studio</label>
                <input
                  type="text"
                  placeholder="Search by studio..."
                  value={filters.studioQuery}
                  onChange={(e) => handleFilterUpdate({ studioQuery: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Release Window</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">From</span>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterUpdate({ startDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">To</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterUpdate({ endDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Price Limit</label>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                    <input
                      type="checkbox"
                      checked={filters.isFree}
                      onChange={(e) => handleFilterUpdate({ isFree: e.target.checked })}
                      className="rounded accent-blue-500 bg-zinc-950 border-zinc-800"
                    />
                    Free Games Only
                  </label>
                </div>
                {!filters.isFree && (
                  <div className="space-y-2 bg-zinc-950 p-3 rounded border border-zinc-850">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>Min: ${filters.minPrice}</span>
                      <span>Max: {filters.maxPrice === 100 ? '$100+' : `$${filters.maxPrice}`}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterUpdate({ maxPrice: Number(e.target.value) })}
                      className="w-full accent-blue-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Minimum Rating</label>
                <div className="grid grid-cols-6 gap-1">
                  {[0, 1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => handleFilterUpdate({ minRating: stars })}
                      className={`py-1.5 px-1 text-center rounded font-mono text-xs transition ${
                        filters.minRating === stars
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-500 border border-transparent'
                      }`}
                    >
                      {stars === 0 ? 'Any' : `${stars}★`}
                    </button>
                  ))}
                </div>
              </div>

              {isAuthenticated && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Library Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.excludeOwned}
                        onChange={(e) => handleFilterUpdate({ excludeOwned: e.target.checked })}
                        className="rounded accent-blue-500 bg-zinc-950 border-zinc-800"
                      />
                      Hide Owned Games
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.includeWishlistedOnly}
                        onChange={(e) => handleFilterUpdate({ includeWishlistedOnly: e.target.checked })}
                        className="rounded accent-blue-500 bg-zinc-950 border-zinc-800"
                      />
                      Wishlist Only
                    </label>
                  </div>
                </div>
              )}

              {/* Order Strategy Dropdown - Moved to the bottom of the filters sidebar */}
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Sort Results</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterUpdate({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs p-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value="release_desc">Newest Releases</option>
                  <option value="release_asc">Older Classics</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="rating_desc">Highest Rating</option>
                </select>
              </div>

            </div>

            <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-mono">
                <span>SQL Insight Emulator</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <pre className="text-[11px] leading-relaxed font-mono text-blue-400 bg-zinc-950/80 p-3 rounded border border-zinc-900 overflow-x-auto text-left whitespace-pre">
                {activeSqlExplanation}
              </pre>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
              <span>GAMES FOUND: {games.length}</span>
              {loading && <span className="text-blue-400 animate-pulse">Searching...</span>}
            </div>

            {error && (
              <div className="bg-rose-950/30 border border-rose-900 text-rose-300 p-4 rounded-xl text-xs font-mono">
                {error}
              </div>
            )}

            {!loading && games.length === 0 && !error && (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl py-24 text-center text-zinc-500 space-y-2">
                <p className="text-sm font-semibold text-zinc-400">No results found</p>
                <p className="text-xs max-w-sm mx-auto">Try adjusting your filters to discover more games.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {!loading && games.map((game) => (
                <div key={game.game_id} className="transition-transform duration-200 hover:-translate-y-1">
                  <GameCard variant="store" game={game} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
