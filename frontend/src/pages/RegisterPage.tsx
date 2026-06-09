import { useState, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Label, TextField, Spinner, Description, FieldError } from '@heroui/react'
import AuthLayout from '../components/AuthLayout'
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

    if (!username.trim() || !email.trim() || !password) {
      setError('Username, email, and password are required')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register(username.trim(), email.trim(), password)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Join GameStore"
      title="Create your account"
      subtitle="Choose your username and login details."
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
                autoComplete="username"
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
                autoComplete="new-password"
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
                autoComplete="new-password"
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

          <Card.Footer className="auth-form-footer">
            <Button
              className="auth-submit"
              isDisabled={
                loading ||
                !username.trim() ||
                !email.trim() ||
                !password ||
                !confirm ||
                passwordMismatch
              }
              isPending={loading}
              type="submit"
            >
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

      <div className="auth-switch animate-in-delay-2">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  )
}
