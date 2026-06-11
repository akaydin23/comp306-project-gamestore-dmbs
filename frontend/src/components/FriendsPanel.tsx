import { useEffect, useState, type SyntheticEvent } from 'react'
import { Button, Spinner } from '@heroui/react'
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
} from '../api/friends'
import type { Friend } from '../api/friends'

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<Friend[]>([])
  const [receiverId, setReceiverId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadSocialData() {
    setError('')
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
      ])
      setFriends(friendsData.friends ?? [])
      setRequests(requestsData.requests ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    Promise.all([getFriends(), getPendingRequests()])
      .then(([friendsData, requestsData]) => {
        if (!active) return
        setFriends(friendsData.friends ?? [])
        setRequests(requestsData.requests ?? [])
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load friends')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSendRequest(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    setError('')

    const id = Number(receiverId)
    if (!Number.isInteger(id) || id <= 0) {
      setError('Enter a valid user ID')
      return
    }

    setSubmitting(true)
    try {
      await sendFriendRequest(id)
      setReceiverId('')
      setMessage('Friend request sent')
      await loadSocialData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAccept(senderId: number) {
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      await acceptFriendRequest(senderId)
      setMessage('Friend request accepted')
      await loadSocialData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="friends-panel friends-panel--loading">
        <Spinner size="sm" />
        <span>Loading friends...</span>
      </div>
    )
  }

  return (
    <section className="friends-panel">
      <div className="friends-header">
        <div>
          <p className="friends-eyebrow">Social</p>
          <h3>Friends</h3>
        </div>
        <span className="friends-count">{friends.length}</span>
      </div>

      <form className="friends-request-form" onSubmit={handleSendRequest}>
        <label htmlFor="friend-id">Send request by user ID</label>
        <div className="friends-request-row">
          <input
            id="friend-id"
            inputMode="numeric"
            min="1"
            placeholder="Example: 4"
            type="number"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
          <Button
            isDisabled={submitting || !receiverId.trim()}
            isPending={submitting}
            size="sm"
            type="submit"
            variant="secondary"
          >
            Send
          </Button>
        </div>
      </form>

      {error && <div className="friends-alert friends-alert--error">{error}</div>}
      {message && <div className="friends-alert friends-alert--success">{message}</div>}

      {requests.length > 0 && (
        <div className="friends-section">
          <h4>Pending invites</h4>
          <div className="friends-list">
            {requests.map((request) => (
              <div className="friend-row" key={request.user_id}>
                <div className="friend-avatar">{request.username.slice(0, 2).toUpperCase()}</div>
                <div className="friend-info">
                  <span>{request.username}</span>
                  <small>User #{request.user_id}</small>
                </div>
                <Button
                  isDisabled={submitting}
                  size="sm"
                  variant="secondary"
                  onPress={() => handleAccept(request.user_id)}
                >
                  Accept
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="friends-section">
        <h4>Friend list</h4>
        {friends.length === 0 ? (
          <p className="friends-empty">No friends yet.</p>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <div className="friend-row" key={friend.user_id}>
                <div className="friend-avatar">{friend.username.slice(0, 2).toUpperCase()}</div>
                <div className="friend-info">
                  <span>{friend.username}</span>
                  <small>User #{friend.user_id}</small>
                </div>
                <span className="friend-status">Online</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
