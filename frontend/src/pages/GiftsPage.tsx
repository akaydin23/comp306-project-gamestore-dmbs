import { useEffect, useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Link } from 'react-router-dom'
import { acceptGift, cancelGift, getReceivedGifts, getSentGifts, rejectGift } from '../api/gifts'
import type { Gift } from '../types'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function statusClass(status: Gift['status']) {
  if (status === 'ACCEPTED') return 'role-badge--developer'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'role-badge--admin'
  return 'role-badge--user'
}

export default function GiftsPage() {
  const [received, setReceived] = useState<Gift[]>([])
  const [sent, setSent] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [busyGiftId, setBusyGiftId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadGifts() {
    setError('')
    try {
      const [receivedRes, sentRes] = await Promise.all([getReceivedGifts(), getSentGifts()])
      setReceived(receivedRes.gifts)
      setSent(sentRes.gifts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gifts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadGifts)
  }, [])

  async function runGiftAction(giftId: number, action: () => Promise<unknown>, success: string) {
    setBusyGiftId(giftId)
    setError('')
    setMessage('')

    try {
      await action()
      setMessage(success)
      await loadGifts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gift action failed')
    } finally {
      setBusyGiftId(null)
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
          <p className="admin-kicker">Player exchange</p>
          <h2 className="page-title">Gifts</h2>
        </div>
        <Link to="/store">
          <Button size="sm" variant="secondary">Send From Store</Button>
        </Link>
      </div>

      {error && <div className="checkout-alert checkout-alert--error">{error}</div>}
      {message && <div className="checkout-alert checkout-alert--success">{message}</div>}

      <section className="admin-section">
        <div className="admin-section-header">
          <h3>Received</h3>
          <span>{received.length} gift{received.length !== 1 ? 's' : ''}</span>
        </div>
        {received.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No received gifts</p>
            <p className="empty-state-desc">Incoming gifts from other users will appear here.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>From</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {received.map((gift) => (
                  <tr key={gift.gift_id}>
                    <td>
                      <strong>{gift.game_name}</strong>
                      <span>{formatDate(gift.gift_date)}</span>
                    </td>
                    <td>{gift.sender_username}</td>
                    <td>{gift.gift_message || 'No message'}</td>
                    <td>
                      <span className={`role-badge ${statusClass(gift.status)}`}>{gift.status}</span>
                    </td>
                    <td>
                      {gift.status === 'PENDING' ? (
                        <div className="admin-table-actions">
                          <Button
                            isPending={busyGiftId === gift.gift_id}
                            size="sm"
                            variant="secondary"
                            onPress={() => void runGiftAction(gift.gift_id, () => acceptGift(gift.gift_id), 'Gift accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            isDisabled={busyGiftId === gift.gift_id}
                            size="sm"
                            variant="danger"
                            onPress={() => void runGiftAction(gift.gift_id, () => rejectGift(gift.gift_id), 'Gift rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h3>Sent</h3>
          <span>{sent.length} gift{sent.length !== 1 ? 's' : ''}</span>
        </div>
        {sent.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No sent gifts</p>
            <p className="empty-state-desc">Send gifts from any game detail page.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>To</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sent.map((gift) => (
                  <tr key={gift.gift_id}>
                    <td>
                      <strong>{gift.game_name}</strong>
                      <span>{formatDate(gift.gift_date)}</span>
                    </td>
                    <td>{gift.recipient_username}</td>
                    <td>{gift.gift_message || 'No message'}</td>
                    <td>
                      <span className={`role-badge ${statusClass(gift.status)}`}>{gift.status}</span>
                    </td>
                    <td>
                      {gift.status === 'PENDING' ? (
                        <Button
                          isPending={busyGiftId === gift.gift_id}
                          size="sm"
                          variant="danger"
                          onPress={() => void runGiftAction(gift.gift_id, () => cancelGift(gift.gift_id), 'Gift cancelled')}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-sm text-muted">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
