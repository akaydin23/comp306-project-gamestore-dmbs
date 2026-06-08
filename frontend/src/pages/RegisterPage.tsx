import { useState, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Label, TextField, Spinner, Description, FieldError } from '@heroui/react'
import { useAuth } from '../context/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordMismatch = confirm.length > 0 && password !== confirm

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register(username, email, password)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
          <p className="mt-1 text-sm text-muted">Create your account</p>
        </div>

        <Card className="animate-in-delay-1">
          <Form onSubmit={handleSubmit}>
            <Card.Content>
              {error && <div className="p-2.5 rounded-lg mb-3 text-xs border border-red-900/50 bg-red-950/50 text-red-400">{error}</div>}

              <div className="flex w-full flex-col gap-4">
                <TextField
                  isRequired
                  name="username"
                  value={username}
                  onChange={setUsername}
                  validate={(value) => {
                    if (value.length > 0 && value.length < 3) {
                      return 'Username must be at least 3 characters'
                    }
                    return null
                  }}
                >
                  <Label>Username</Label>
                  <Input placeholder="Choose a username" variant="secondary" />
                  <FieldError />
                </TextField>

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
                  validate={(value) => {
                    if (value.length > 0 && value.length < 6) {
                      return 'Password must be at least 6 characters'
                    }
                    return null
                  }}
                >
                  <Label>Password</Label>
                  <Input placeholder="••••••••" variant="secondary" />
                  <Description>At least 6 characters</Description>
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  isInvalid={passwordMismatch}
                  name="confirm"
                  type="password"
                  value={confirm}
                  onChange={setConfirm}
                >
                  <Label>Confirm Password</Label>
                  <Input placeholder="••••••••" variant="secondary" />
                  {passwordMismatch && (
                    <FieldError>Passwords do not match</FieldError>
                  )}
                </TextField>
              </div>
            </Card.Content>

            <Card.Footer className="flex-col gap-3 mt-8">
              <Button className="w-full" isPending={loading} type="submit">
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? 'Creating account...' : 'Create Account'}
                  </>
                )}
              </Button>
            </Card.Footer>
          </Form>
        </Card>

        <div className="text-center mt-5 text-sm text-muted animate-in-delay-2">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
