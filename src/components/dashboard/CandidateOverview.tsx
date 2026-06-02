import { resolveUploadUrl } from '@/lib/asset-url'

interface CandidateOverviewProps {
  name: string
  title: string
  introduction: string
  profileImage?: string | null
}

export default function CandidateOverview({
  name,
  title,
  introduction,
  profileImage,
}: CandidateOverviewProps) {
  const imageUrl = resolveUploadUrl(profileImage)

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600/20 border-2 border-indigo-500">
          <span className="text-3xl font-bold text-indigo-400">{name.charAt(0)}</span>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-white">{name}</h1>
        <p className="text-lg text-indigo-400">{title}</p>
        <p className="mt-2 max-w-lg text-sm text-gray-400">{introduction}</p>
      </div>
    </div>
  )
}
