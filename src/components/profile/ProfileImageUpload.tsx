import { useRef } from 'react'
import { useProfileStore } from '@/stores/profileStore'
import { resolveUploadUrl } from '@/lib/asset-url'
import { getApiErrorMessage } from '@/lib/errors'

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

export default function ProfileImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { profile, isLoading, uploadProfileImage } = useProfileStore()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Profile image must be JPEG, PNG, or WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      alert('Profile image must be 2 MB or smaller.')
      return
    }

    try {
      await uploadProfileImage(file)
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to upload profile image.'))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const imageUrl = resolveUploadUrl(profile?.basic.profileImage)

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={profile?.basic.name ?? 'Profile'}
          className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600/20 border-2 border-indigo-500">
          <span className="text-3xl font-bold text-indigo-400">
            {profile?.basic.name?.charAt(0) ?? '?'}
          </span>
        </div>
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="text-sm text-indigo-400 hover:underline disabled:opacity-50"
        >
          {isLoading ? 'Uploading…' : imageUrl ? 'Change photo' : 'Upload photo (max 2 MB)'}
        </button>
        <p className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
