import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export default function OnboardingComplete() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
          <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">You're all set!</h1>
        <p className="text-gray-400">
          Your portfolio has been created. View it, share it, or tweak it from your dashboard.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/edit-profile">
            <Button variant="secondary">Edit Profile</Button>
          </Link>
          <Link to="/settings">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
