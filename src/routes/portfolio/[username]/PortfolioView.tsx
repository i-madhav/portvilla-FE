import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader } from '@/components/ui'
import { useProfileStore, type Profile } from '@/stores/profileStore'
import CandidateOverview from '@/components/dashboard/CandidateOverview'
import SkillsSection from '@/components/dashboard/SkillsSection'
import TimelineSection from '@/components/dashboard/TimelineSection'
import ProjectsSection from '@/components/dashboard/ProjectsSection'
import ExperienceSection from '@/components/dashboard/ExperienceSection'
import SocialLinks from '@/components/dashboard/SocialLinks'

export default function PortfolioView() {
  const { username } = useParams<{ username: string }>()
  const { profile, isLoading, fetchPublicProfile } = useProfileStore()
  const [visibilityGate, setVisibilityGate] = useState(true)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

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

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Portfolio not found</h1>
          <p className="mt-2 text-gray-400">This portfolio doesn't exist or is private.</p>
        </div>
      </div>
    )
  }

  // Visibility gate
  if (profile.visibility === 'private' && !visibilityGate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">This portfolio is private</h1>
          <p className="mt-2 text-gray-400">Only the owner can view this portfolio.</p>
        </div>
      </div>
    )
  }

  if (profile.visibility === 'protected' && !visibilityGate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white text-center">Password Required</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter portfolio password"
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          <button
            onClick={async () => {
              try {
                // verify password via API
                setVisibilityGate(true)
              } catch {
                setPasswordError('Incorrect password')
              }
            }}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View Portfolio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Orb placeholder */}
      <div className="sticky top-0 z-10 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 py-3">
        <p className="text-sm text-gray-400">🤖 Ask me anything about {profile.basic.name}</p>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
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
          linkedin={profile.external.linkedin}
          github={profile.external.github}
          twitter={profile.external.twitter}
          personalWebsite={profile.external.personalWebsite}
        />
      </div>
    </div>
  )
}
