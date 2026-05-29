import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/lib/api-client'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string })?.email ?? ''
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.verifyEmail({ email, otp })
      navigate('/login', {
        state: { message: 'Email verified! You can now log in.' },
        replace: true,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setError('Invalid or expired code. Try requesting a new one.')
        } else if (err.status === 409) {
          // Already verified — redirect to login
          navigate('/login', {
            state: { message: 'Email already verified. Log in below.' },
            replace: true,
          })
        } else {
          setError(err.message)
        }
      } else {
        setError('Verification failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    setMessage('')
    try {
      await authService.resendOtp({ email })
      setMessage('A new code has been sent to your email.')
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        navigate('/login', {
          state: { message: 'Email already verified. Log in below.' },
          replace: true,
        })
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not resend code.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Verify your email</h1>
          <p className="mt-1 text-sm text-gray-400">
            Enter the 6-digit code sent to <span className="text-indigo-400">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {message && (
            <div className="rounded-lg bg-green-900/50 px-4 py-2 text-sm text-green-300">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Verification Code"
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
            Verify Email
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend code'}
          </button>
        </div>
      </div>
    </div>
  )
}
