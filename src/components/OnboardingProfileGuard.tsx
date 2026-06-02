import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'

/**
 * Blocks onboarding when the authenticated user already has a portfolio profile.
 */
export function OnboardingProfileGuard({ children }: { children: React.ReactNode }) {
  const { profile, fetchMyProfile } = useProfileStore()
  const [checking, setChecking] = useState(() => !profile)

  useEffect(() => {
    if (profile) {
      setChecking(false)
      return
    }

    let cancelled = false

    async function verify() {
      await fetchMyProfile()
      if (!cancelled) setChecking(false)
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [profile, fetchMyProfile])

  if (profile) {
    return <Navigate to="/settings" replace />
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader />
      </div>
    )
  }

  return <>{children}</>
}
