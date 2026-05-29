import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Loader } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'

export default function CandidateSettings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { profile, isLoading, fetchMyProfile } = useProfileStore()

  useEffect(() => {
    fetchMyProfile()
  }, [fetchMyProfile])

  const shareUrl = profile ? `${window.location.origin}/${profile.username}` : ''

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <span className="text-lg font-bold text-indigo-400">PortVilla</span>
        <div className="flex items-center gap-4">
          <Link to={profile ? `/${profile.username}` : '#'} className="text-sm text-gray-400 hover:text-white">
            View Portfolio
          </Link>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/') }}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-gray-400">Manage your portfolio</p>

        {isLoading ? (
          <div className="mt-12">
            <Loader />
          </div>
        ) : profile ? (
          <div className="mt-8 space-y-6">
            {/* Profile Summary */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-lg font-semibold">{profile.basic.name}</h2>
              <p className="text-sm text-gray-400">{profile.basic.title}</p>
              <p className="mt-1 text-xs text-gray-500">@{profile.username}</p>

              {shareUrl && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 border border-gray-700"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    Copy
                  </Button>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile.visibility === 'public'
                    ? 'bg-green-900/50 text-green-300'
                    : profile.visibility === 'protected'
                    ? 'bg-yellow-900/50 text-yellow-300'
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  {profile.visibility}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Skills', value: profile.professional.skills.length },
                { label: 'Technologies', value: profile.professional.technologies.length },
                { label: 'Experience', value: profile.professional.experience.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link to="/edit-profile">
                <Button>Edit Profile</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-400">No profile yet</p>
            <div className="mt-4">
              <Link to="/onboarding">
                <Button>Create Profile</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
