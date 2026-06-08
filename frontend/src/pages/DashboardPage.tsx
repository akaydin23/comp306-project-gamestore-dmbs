import { Button, Card } from '@heroui/react'
import { useAuth } from '../context/useAuth'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  if (!user) return null

  const initials = user.username.slice(0, 2).toUpperCase()

  const roleClass =
    user.role === 'ADMIN'
      ? 'role-badge--admin'
      : user.role === 'DEVELOPER'
        ? 'role-badge--developer'
        : 'role-badge--user'

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <div className="text-center mb-8 relative z-10 animate-in">
          <h1 className="text-2xl font-bold tracking-tight m-0 text-foreground">
            Game<span className="text-accent">Store</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Welcome back</p>
        </div>

        <Card className="animate-in-delay-1">
          <Card.Content>
            <div className="dashboard-header">
              <div className="dashboard-avatar">{initials}</div>
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
          </Card.Content>

          <Card.Footer>
            <Button className="w-full" onPress={logout} variant="danger">
              Sign Out
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}
