import { useState, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Label, TextField, Spinner } from '@heroui/react'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-8 relative z-10 animate-in">
          <h1 className="text-2xl font-bold tracking-tight m-0 text-foreground">
            Game<span className="text-accent">Store</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to your account</p>
        </div>

        <Card className="animate-in-delay-1">
          <Form onSubmit={handleSubmit}>
            <Card.Content>
              {error && <div className="p-2.5 rounded-lg mb-3 text-xs border border-red-900/50 bg-red-950/50 text-red-400">{error}</div>}

              <div className="flex w-full flex-col gap-4">
                <TextField
                  isRequired
                  name="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                >
                  <Label>Email</Label>
                  <Input placeholder="you@example.com" variant="secondary" />
                </TextField>

                <TextField
                  isRequired
                  name="password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                >
                  <Label>Password</Label>
                  <Input placeholder="••••••••" variant="secondary" />
                </TextField>
              </div>
            </Card.Content>

            <Card.Footer className="flex-col gap-3 mt-8">
              <Button className="w-full" isPending={loading} type="submit">
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? 'Signing in...' : 'Sign In'}
                  </>
                )}
              </Button>
            </Card.Footer>
          </Form>
        </Card>

        <div className="text-center mt-5 text-sm text-muted animate-in-delay-2">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">Create one</Link>
        </div>
      </div>
    </div>
  )
}
