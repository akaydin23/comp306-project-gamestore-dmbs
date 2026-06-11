import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spinner } from '@heroui/react'
import { getGameById } from '../api/games'
import type { Game } from '../types'

const FAKE_LEVELS = [
  'Loading assets... 30%',
  'Initializing engine... 60%',
  'Rendering world... 100%',
  'Ready - Press Start',
]

export default function PlayPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [bootStep, setBootStep] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const id = Number(gameId)
    if (!Number.isInteger(id) || id <= 0) return

    getGameById(id)
      .then((res) => setGame(res.game))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [gameId])

  useEffect(() => {
    if (started) return
    const timer = setInterval(() => {
      setBootStep((s) => {
        if (s >= FAKE_LEVELS.length - 1) {
          clearInterval(timer)
          return s
        }
        return s + 1
      })
    }, 800)
    return () => clearInterval(timer)
  }, [started])

  const handleExit = useCallback(() => {
    navigate('/library')
  }, [navigate])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleExit])

  if (loading) {
    return (
      <div className="play-shell">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="play-shell">
        <div className="play-container">
          <p className="play-text-dim">Game not found</p>
          <Button variant="secondary" onPress={handleExit}>Back to Library</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="play-shell">
      <div className="play-scanlines" aria-hidden="true" />

      <div className="play-container">
        <div className="play-header">
          <p className="play-label">Now Playing</p>
          <h1 className="play-title">{game.name}</h1>
          <p className="play-studio">
            {game.studio_name ? `By ${game.studio_name}` : 'Unknown Developer'}
          </p>
        </div>

        <div className="play-screen">
          {!started ? (
            <div className="play-boot">
              {FAKE_LEVELS.slice(0, bootStep + 1).map((line, i) => (
                <p
                  key={line}
                  className={`play-boot-line ${i === FAKE_LEVELS.length - 1 ? 'play-blink' : ''}`}
                >
                  {line}
                </p>
              ))}
              {bootStep >= FAKE_LEVELS.length - 1 && (
                <Button
                  className="play-start-btn"
                  size="lg"
                  onPress={() => setStarted(true)}
                >
                  START
                </Button>
              )}
            </div>
          ) : (
            <div className="play-game">
              <div className="play-game-world" aria-hidden="true">
                <div className="play-game-player">@</div>
                <div className="play-game-enemy play-game-enemy--1">x</div>
                <div className="play-game-enemy play-game-enemy--2">x</div>
                <div className="play-game-enemy play-game-enemy--3">x</div>
                <div className="play-game-pickup">*</div>
                <div className="play-game-wall play-game-wall--1" />
                <div className="play-game-wall play-game-wall--2" />
                <div className="play-game-wall play-game-wall--3" />
              </div>

              <div className="play-game-hud">
                Shield x3
                <span className="play-sep">|</span>
                Energy x42
                <span className="play-sep">|</span>
                Score: 1,337
                <span className="play-sep">|</span>
                Lives: 3
              </div>

              <p className="play-game-subtitle">
                Use WASD to move - SPACE to jump - Mouse to aim
              </p>
            </div>
          )}
        </div>

        <div className="play-footer">
          <Button variant="ghost" size="sm" onPress={handleExit}>
            Exit Game
          </Button>
          <span className="play-hint">ESC to quit</span>
        </div>
      </div>
    </div>
  )
}
