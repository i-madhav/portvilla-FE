import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Loader, Modal, ErrorBanner } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useProfileStore } from '@/stores/profileStore'
import { authService } from '@/services/auth.service'
import { ProfileVisibility } from '@/types/profile'
import { getApiErrorMessage } from '@/lib/errors'

export default function CandidateSettings() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()
  const {
    profile,
    isLoading,
    notFound,
    error,
    fetchMyProfile,
    updateProfile,
    deleteProfile,
    clearError,
    reset: resetProfile,
  } = useProfileStore()

  const [hasCheckedProfile, setHasCheckedProfile] = useState(() => !!profile)

  useEffect(() => {
    if (profile) {
      setHasCheckedProfile(true)
      return
    }

    let cancelled = false

    async function load() {
      await fetchMyProfile()
      if (!cancelled) setHasCheckedProfile(true)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [profile, fetchMyProfile])

  const [visibilityOverride, setVisibilityOverride] = useState<ProfileVisibility | null>(null)
  const [protectedPassword, setProtectedPassword] = useState('')
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const visibilityValue =
    visibilityOverride ?? profile?.visibility ?? ProfileVisibility.PUBLIC

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Clear locally even if API call fails
    } finally {
      clearAuth()
      resetProfile()
      navigate('/login', { replace: true })
    }
  }

  const handleVisibilitySave = async () => {
    setSavingVisibility(true)
    try {
      await updateProfile({
        visibility: {
          visibility: visibilityValue,
          ...(visibilityValue === ProfileVisibility.PROTECTED && protectedPassword
            ? { protectedPassword }
            : {}),
        },
      })
      setProtectedPassword('')
      setVisibilityOverride(null)
    } catch (err) {
      alert(getApiErrorMessage(err))
    } finally {
      setSavingVisibility(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProfile()
      setShowDeleteModal(false)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      alert(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const shareUrl = profile
    ? `${window.location.protocol}//${window.location.host}/${profile.username}`
    : ''

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <span className="text-lg font-bold text-indigo-400">PortVilla</span>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-400">{user.email}</span>}
          {profile && (
            <Link
              to={`/${profile.username}`}
              className="text-sm text-gray-400 hover:text-white"
            >
              View Portfolio
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-gray-400">Manage your portfolio</p>

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} onDismiss={clearError} />
          </div>
        )}

        {(!hasCheckedProfile || isLoading) && !profile ? (
          <div className="mt-12">
            <Loader />
          </div>
        ) : profile ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-lg font-semibold">{profile.basic.name}</h2>
              <p className="text-sm text-gray-400">{profile.basic.title}</p>
              <p className="mt-1 text-xs text-gray-500">@{profile.username}</p>

              {shareUrl && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                    Copy
                  </Button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    profile.visibility === ProfileVisibility.PUBLIC
                      ? 'bg-green-900/50 text-green-300'
                      : profile.visibility === ProfileVisibility.PROTECTED
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                  }`}
                >
                  {profile.visibility}
                </span>
                <span className="text-xs text-gray-500">
                  AI: {profile.aiSettings.provider}
                  {profile.aiSettings.model ? ` / ${profile.aiSettings.model}` : ''}
                  {profile.aiSettings.apiKeyConfigured ? ' (key configured)' : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Skills', value: profile.professional.skills.length },
                { label: 'Technologies', value: profile.professional.technologies.length },
                { label: 'Experience', value: profile.professional.experience.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
              <h3 className="font-semibold">Visibility</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(ProfileVisibility).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibilityOverride(v)}
                    className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                      visibilityValue === v
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {visibilityValue === ProfileVisibility.PROTECTED && (
                <input
                  type="password"
                  value={protectedPassword}
                  onChange={(e) => setProtectedPassword(e.target.value)}
                  placeholder="New password (min 6 chars, leave blank to keep)"
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                />
              )}
              <Button size="sm" onClick={handleVisibilitySave} isLoading={savingVisibility}>
                Update Visibility
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/edit-profile">
                <Button>Edit Profile</Button>
              </Link>
              <Button variant="ghost" onClick={() => setShowDeleteModal(true)}>
                Delete Profile
              </Button>
            </div>
          </div>
        ) : notFound ? (
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Your account is active, but you have not created a portfolio profile yet.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Complete onboarding to publish your shareable URL.
            </p>
            <div className="mt-4">
              <Link to="/onboarding">
                <Button>Create Profile</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center text-gray-400">Unable to load profile.</div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Profile"
      >
        <p className="text-sm text-gray-400">
          This permanently deletes your portfolio and all associated data. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} isLoading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
