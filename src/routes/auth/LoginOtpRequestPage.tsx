import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/lib/api-client'

export default function LoginOtpRequestPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.requestLoginOtp({ email })
      navigate('/login/otp/verify', { state: { email } })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          navigate('/verify-email', { state: { email } })
          return
        }
        if (err.status === 404) {
          setError('No account found for this email.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Could not send code.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Passwordless Login</h1>
          <p className="mt-1 text-sm text-gray-400">
            We'll send a one-time code to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" isLoading={loading}>
            Send Login Code
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-400">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Back to password login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
