import { useState, type SyntheticEvent } from 'react'
import { Button, Card } from '@heroui/react'
import { useAuth } from '../context/useAuth'
import FriendsPanel from '../components/FriendsPanel'

export default function DashboardPage() {
  const { user, logout, updateProfile } = useAuth()
  const [username, setUsername] = useState(user?.username ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profile_image_url ?? '')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  if (!user) return null

  const initials = user.username.slice(0, 2).toUpperCase()

  const roleClass =
    user.role === 'ADMIN'
      ? 'role-badge--admin'
      : user.role === 'DEVELOPER'
        ? 'role-badge--developer'
        : 'role-badge--user'

  return (
    <div className="dashboard-page" style={{ 
      display: 'flex', 
      gap: '30px', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      padding: '40px max(20px, 4%)'
    }}>
      <div className="dashboard-card" style={{ flexShrink: 0 }}>
        <div className="text-center mb-8 relative z-10 animate-in">
          <h1 className="text-2xl font-bold tracking-tight m-0 text-foreground">
            Game<span className="text-accent">Store</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Welcome back</p>
        </div>

        <Card className="animate-in-delay-1">
          <Card.Content>
            <div className="dashboard-header">
              <div className="dashboard-avatar">
                {user.profile_image_url && user.profile_image_url !== 'default.jpg' ? (
                  <img src={user.profile_image_url} alt="" />
                ) : (
                  initials
                )}
              </div>
              <div className="dashboard-info">
                <h2>{user.username}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="dashboard-stats">
              <div className="stat-item">
                <p className="stat-label">Role</p>
                <p className="stat-value">
                  <span className={`role-badge ${roleClass}`}>{user.role}</span>
                </p>
              </div>
              <div className="stat-item">
                <p className="stat-label">User ID</p>
                <p className="stat-value">#{user.user_id}</p>
              </div>
            </div>
            <form
              className="profile-form"
              onSubmit={async (e: SyntheticEvent<HTMLFormElement>) => {
                e.preventDefault()
                setProfileMessage('')
                setProfileError('')
                setSavingProfile(true)

                try {
                  await updateProfile(username, bio, profileImageUrl || 'default.jpg')
                  setProfileMessage('Profile updated')
                } catch (err) {
                  setProfileError(err instanceof Error ? err.message : 'Could not update profile')
                } finally {
                  setSavingProfile(false)
                }
              }}
              style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div className="profile-form-header" style={{ borderTop: '1px solid #2a475e', paddingTop: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#66c0f4' }}>Edit Profile</h3>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                Username
                <input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #2a475e', backgroundColor: '#101822', color: '#fff' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                Bio
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #2a475e', backgroundColor: '#101822', color: '#fff', resize: 'vertical', minHeight: '60px' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                Profile image URL
                <input
                  value={profileImageUrl}
                  placeholder="https://..."
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #2a475e', backgroundColor: '#101822', color: '#fff' }}
                />
              </label>
              {profileError && <div style={{ color: '#ff4d4d', fontSize: '12px' }}>⚠️ {profileError}</div>}
              {profileMessage && <div style={{ color: '#4caf50', fontSize: '12px' }}>✅ {profileMessage}</div>}
              <Button
                className="profile-save"
                isDisabled={!username.trim()}
                isPending={savingProfile}
                type="submit"
                variant="secondary"
                style={{ alignSelf: 'flex-start', marginTop: '5px' }}
              >
                Save Profile
              </Button>
            </form>
          </Card.Content>
          <Card.Footer>
            <Button className="w-full" onPress={logout} variant="danger">
              Sign Out
            </Button>
          </Card.Footer>
        </Card>
      </div>
      <div style={{ marginTop: '76px' }}>
        <FriendsPanel />
      </div>
    </div>
  )
}
