import { useState, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Label, TextField, Spinner } from '@heroui/react'
import AuthLayout from '../components/AuthLayout'
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

    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      await login(normalizedEmail, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Use your account details to continue."
    >
      <Card className="auth-form-card animate-in-delay-1">
        <Form onSubmit={handleSubmit}>
          <Card.Content>
            {error && (
              <div role="alert" className="auth-error">
                {error}
              </div>
            )}

            <div className="auth-fields">
              <TextField
                isRequired
                autoComplete="email"
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
                autoComplete="current-password"
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

          <Card.Footer className="auth-form-footer">
            <Button
              className="auth-submit"
              isDisabled={loading || !email.trim() || !password}
              isPending={loading}
              type="submit"
            >
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

      <div className="auth-switch animate-in-delay-2">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </div>
    </AuthLayout>
  )
}
