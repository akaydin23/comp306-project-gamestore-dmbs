import { useEffect, useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
} from '../api/friends.js'
import { searchUsers } from '../api/users.js'
import type { Friend } from '../api/friends.js'
import type { UserSearchResult } from '../api/users.js'

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
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
      
      const friendsArray = Array.isArray(friendsData) ? friendsData : (friendsData.friends ?? [])
      const requestsArray = Array.isArray(requestsData) ? requestsData : (requestsData.requests ?? [])
      
      setFriends(friendsArray)
      setRequests(requestsArray)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSocialData()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setError('')
    try {
      const data = (await searchUsers(searchQuery)) as { users?: UserSearchResult[] } | UserSearchResult[]
      const usersArray = Array.isArray(data) ? data : (data?.users || [])
      setSearchResults(usersArray)
      if (usersArray.length === 0) {
        setError('No users found with that username')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to execute search')
    }
  }

  const handleSendRequest = async (receiverId: number) => {
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      await sendFriendRequest(receiverId)
      setSearchQuery('')
      setSearchResults([])
      setMessage('Friend request sent!')
      await loadSocialData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async (senderId: number) => {
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      await acceptFriendRequest(senderId)
      setMessage('Friend request accepted!')
      await loadSocialData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="friends-panel friends-panel--loading" style={{ padding: '15px', color: '#aaa', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Spinner size="sm" />
        <span>Loading friends...</span>
      </div>
    )
  }

  return (
    <section className="friends-panel" style={{
      width: '280px',
      backgroundColor: '#1b2838',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      fontFamily: 'sans-serif'
    }}>
      <div className="friends-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a475e', paddingBottom: '10px', marginBottom: '15px' }}>
        <div>
          <p className="friends-eyebrow" style={{ margin: 0, fontSize: '11px', color: '#66c0f4', textTransform: 'uppercase' }}>Social</p>
          <h3 style={{ margin: 0, color: '#fff' }}>Friends</h3>
        </div>
        <span className="friends-count" style={{ backgroundColor: '#2a475e', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{friends.length}</span>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '15px', display: 'flex', gap: '6px' }}>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #2a475e', backgroundColor: '#101822', color: '#fff', fontSize: '13px' }}
        />
        <Button 
          isDisabled={submitting || !searchQuery.trim()} 
          size="sm" 
          type="submit" 
          variant="secondary"
          style={{ backgroundColor: '#66c0f4', color: '#fff' }}
        >
          Find
        </Button>
      </form>

      {error && <div style={{ color: '#ff4d4d', fontSize: '12px', marginBottom: '10px' }}>⚠️ {error}</div>}
      {message && <div style={{ color: '#4caf50', fontSize: '12px', marginBottom: '10px' }}>✅ {message}</div>}

      {searchResults.length > 0 && (
        <div style={{ backgroundColor: '#101822', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #2a475e' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#66c0f4' }}>Search Results</h4>
          {searchResults.map(res => (
            <div key={res.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px' }}>{res.username}</span>
              <Button 
                isDisabled={submitting}
                onClick={() => handleSendRequest(res.user_id)} 
                size="sm"
                style={{ backgroundColor: '#4c6b22', color: '#fff', padding: '2px 8px', height: 'auto', minWidth: 'auto' }}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="friends-section" style={{ marginBottom: '20px', backgroundColor: '#2a475e', padding: '10px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ffb142' }}>Pending Invites ({requests.length})</h4>
          <div className="friends-list">
            {requests.map((request) => (
              <div className="friend-row" key={request.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="friend-avatar" style={{ width: '24px', height: '24px', backgroundColor: '#101822', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                    {request.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="friend-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px' }}>{request.username}</span>
                  </div>
                </div>
                <Button
                  isDisabled={submitting}
                  size="sm"
                  style={{ backgroundColor: '#5c7e10', color: '#fff' }}
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
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#c7d5e0' }}>Friend List</h4>
        {friends.length === 0 ? (
          <p className="friends-empty" style={{ color: '#8f98a0', fontSize: '13px', margin: 0 }}>No friends yet.</p>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <div className="friend-row" key={friend.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #233c51' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="friend-avatar" style={{ width: '24px', height: '24px', backgroundColor: '#2a475e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                    {friend.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="friend-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', color: '#abe4f2' }}>{friend.username}</span>
                  </div>
                </div>
                <span className="friend-status" style={{ fontSize: '11px', color: '#57cbde' }}>● Online</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}