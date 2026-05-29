import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import api from '@/lib/api'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as any)?.email || ''
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/verify-email', { email, token })
      setVerified(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-verification', { email })
    } catch {
      // silent
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-400">Email Verified!</h1>
          <p className="mt-2 text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Verify your email</h1>
          <p className="mt-1 text-sm text-gray-400">
            Enter the verification code sent to {email || 'your email'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <Input
            label="Verification Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your code"
            required
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Verify Email
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResend}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  )
}
