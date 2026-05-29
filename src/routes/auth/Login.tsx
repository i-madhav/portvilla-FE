import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api-client'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setTokens } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const successMessage = (location.state as { message?: string })?.message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokens = await authService.login({ email, password })
      setTokens(tokens)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          navigate('/verify-email', { state: { email } })
          return
        }
        setError(err.message || 'Invalid email or password.')
      } else {
        setError('Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-400">Log in to your PortVilla account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="rounded-lg bg-green-900/50 px-4 py-2 text-sm text-green-300">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Log in
          </Button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
              Sign up
            </Link>
          </p>
          <p>
            <Link to="/login/otp" className="text-indigo-400 hover:text-indigo-300">
              Log in with email code instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
