import { useRef } from 'react'
import { useProfileStore } from '@/stores/profileStore'
import { resolveUploadUrl } from '@/lib/asset-url'
import { getApiErrorMessage } from '@/lib/errors'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'application/pdf'

export default function ResumeUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { profile, isLoading, uploadResume } = useProfileStore()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== ACCEPT) {
      alert('Resume must be a PDF file.')
      return
    }
    if (file.size > MAX_BYTES) {
      alert('Resume must be 5 MB or smaller.')
      return
    }

    try {
      await uploadResume(file)
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to upload resume.'))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const resumeUrl = resolveUploadUrl(profile?.professional.resume.url)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      {resumeUrl ? (
        <div className="space-y-2">
          <p className="text-sm text-green-400">Resume uploaded</p>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-indigo-400 hover:underline"
          >
            View current resume
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="block text-xs text-gray-400 hover:text-white disabled:opacity-50"
          >
            Replace resume
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="text-sm text-indigo-400 hover:underline disabled:opacity-50"
        >
          {isLoading ? 'Uploading…' : 'Upload PDF resume (max 5 MB)'}
        </button>
      )}
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
