import { useEffect, useState } from 'react';
import { getFriends, getPendingRequests, acceptFriendRequest } from '../api/friends.js';
import type { Friend } from '../api/friends.js';

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSocialData = async () => {
    try {
      const friendsData = await getFriends();
      const requestsData = await getPendingRequests();
      setFriends(friendsData.friends || []);
      setRequests(requestsData.requests || []);
    } catch (err) {
      console.error('Failed to load social data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, []);

  const handleAccept = async (senderId: number) => {
    try {
      await acceptFriendRequest(senderId);
      loadSocialData();
    } catch (err) {
      alert('Error accepting friend request');
    }
  };

  if (loading) return <div style={{ padding: '15px', color: '#aaa' }}>Loading social network...</div>;

  return (
    <div style={{
      width: '280px',
      backgroundColor: '#1b2838',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ borderBottom: '1px solid #2a475e', paddingBottom: '10px', marginTop: 0, color: '#66c0f4' }}>
        Friends System
      </h3>

      {requests.length > 0 && (
        <div style={{ marginBottom: '20px', backgroundColor: '#2a475e', padding: '10px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ffb142' }}>Pending Invites ({requests.length})</h4>
          {requests.map(req => (
            <div key={req.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px' }}>{req.username}</span>
              <button 
                onClick={() => handleAccept(req.user_id)}
                style={{
                  backgroundColor: '#5c7e10',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#c7d5e0' }}>All Friends ({friends.length})</h4>
        {friends.length === 0 ? (
          <p style={{ color: '#8f98a0', fontSize: '13px', margin: 0 }}>No friends added yet.</p>
        ) : (
          friends.map(friend => (
            <div key={friend.user_id} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #233c51' }}>
              {/* Online indicator circle */}
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#57cbde', marginRight: '10px' }}></div>
              <span style={{ fontSize: '14px', color: '#abe4f2' }}>{friend.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}