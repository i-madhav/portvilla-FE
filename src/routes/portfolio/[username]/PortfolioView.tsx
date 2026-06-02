import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader, ErrorBanner } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'
import CandidateOverview from '@/components/dashboard/CandidateOverview'
import SkillsSection from '@/components/dashboard/SkillsSection'
import TimelineSection from '@/components/dashboard/TimelineSection'
import ProjectsSection from '@/components/dashboard/ProjectsSection'
import ExperienceSection from '@/components/dashboard/ExperienceSection'
import SocialLinks from '@/components/dashboard/SocialLinks'

export default function PortfolioView() {
  const { username } = useParams<{ username: string }>()
  const { publicProfile, isLoading, error, notFound, fetchPublicProfile } = useProfileStore()

  useEffect(() => {
    if (username) {
      fetchPublicProfile(username)
    }
  }, [username, fetchPublicProfile])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader size="lg" />
      </div>
    )
  }

  if (notFound || !publicProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white">Portfolio not available</h1>
          <p className="mt-2 text-gray-400">
            {error ??
              'This portfolio does not exist, is private, or the public dashboard is not yet available.'}
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Public portfolio viewing requires the backend dashboard module, which is coming soon.
          </p>
        </div>
      </div>
    )
  }

  const profile = publicProfile

  if (profile.visibility === 'private') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">This portfolio is private</h1>
          <p className="mt-2 text-gray-400">Only the owner can view this portfolio.</p>
        </div>
      </div>
    )
  }

  if (profile.visibility === 'protected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-bold text-white">Password Required</h1>
          <p className="text-sm text-gray-400">
            Protected portfolio password verification will be available when the backend dashboard
            module ships.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-10 flex items-center justify-center border-b border-gray-800 bg-gray-950/80 py-3 backdrop-blur-sm">
        <p className="text-sm text-gray-400">Ask me anything about {profile.basic.name}</p>
      </div>

      {error && (
        <div className="mx-auto max-w-4xl px-6 pt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-12">
        <CandidateOverview
          name={profile.basic.name}
          title={profile.basic.title}
          introduction={profile.basic.introduction}
          profileImage={profile.basic.profileImage}
        />

        <SkillsSection
          skills={profile.professional.skills}
          technologies={profile.professional.technologies}
        />

        <TimelineSection
          education={profile.professional.education}
          experience={profile.professional.experience}
        />

        <ExperienceSection experience={profile.professional.experience} />

        <ProjectsSection projects={profile.external.projects} />

        <SocialLinks
          linkedin={profile.external.linkedin ?? undefined}
          github={profile.external.github ?? undefined}
          twitter={profile.external.twitter ?? undefined}
          personalWebsite={profile.external.personalWebsite ?? undefined}
        />
      </div>
    </div>
  )
}
