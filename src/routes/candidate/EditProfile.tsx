import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'
import { Loader } from '@/components/ui'

export default function EditProfile() {
  const navigate = useNavigate()
  const { profile, isLoading, fetchMyProfile, updateProfile } = useProfileStore()

  const [basic, setBasic] = useState({
    name: '',
    title: '',
    introduction: '',
    aboutMe: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) {
      fetchMyProfile()
    } else {
      setBasic({
        name: profile.basic?.name || '',
        title: profile.basic?.title || '',
        introduction: profile.basic?.introduction || '',
        aboutMe: profile.basic?.aboutMe || '',
      })
    }
  }, [profile, fetchMyProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ basic } as any)
      navigate('/settings')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <span className="text-lg font-bold text-indigo-400">PortVilla</span>
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
          Back
        </Button>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-400">
          Update your professional information
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Full Name"
            value={basic.name}
            onChange={(e) => setBasic({ ...basic, name: e.target.value })}
            required
          />
          <Input
            label="Professional Title"
            value={basic.title}
            onChange={(e) => setBasic({ ...basic, title: e.target.value })}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              Introduction
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              value={basic.introduction}
              onChange={(e) =>
                setBasic({ ...basic, introduction: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              About Me
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              value={basic.aboutMe}
              onChange={(e) =>
                setBasic({ ...basic, aboutMe: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
