import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api-client'
import { resolvePostAuthPath } from '@/lib/post-auth-redirect'

export default function LoginOtpVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string })?.email ?? ''
  const { setTokens } = useAuth()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokens = await authService.loginWithOtp({ email, otp })
      setTokens(tokens)
      const nextPath = await resolvePostAuthPath()
      navigate(nextPath, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setError('Invalid or expired code. Request a new one.')
        } else {
          setError(err.message)
        }
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
          <h1 className="text-2xl font-bold text-white">Enter Login Code</h1>
          <p className="mt-1 text-sm text-gray-400">
            Enter the code sent to <span className="text-indigo-400">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Login Code"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
          />
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={otp.length !== 6}
          >
            Log in
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-400">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={() => navigate('/login/otp', { replace: true })}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Request again
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
