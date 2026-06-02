import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Loader, ErrorBanner } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'
import ProfileImageUpload from '@/components/profile/ProfileImageUpload'
import ResumeUpload from '@/components/profile/ResumeUpload'
import type { ProfileData, CurrentPosition, EducationEntry, ExperienceEntry } from '@/types/profile'
import { LlmProvider, ProfileVisibility } from '@/types/profile'
import { getApiErrorMessage } from '@/lib/errors'

function Section({
  title,
  children,
  onSave,
  saving,
  saved,
}: {
  title: string
  children: React.ReactNode
  onSave: () => void
  saving: boolean
  saved: boolean
}) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {saved && <span className="text-xs text-green-400">Saved</span>}
      </div>
      {children}
      <div className="flex justify-end">
        <Button size="sm" onClick={onSave} isLoading={saving}>
          Save {title}
        </Button>
      </div>
    </section>
  )
}

function EditProfileForm({
  profile,
  onSaveSection,
  savingSection,
  savedSection,
  sectionError,
  onDismissError,
}: {
  profile: ProfileData
  onSaveSection: (section: string, fn: () => Promise<void>) => Promise<void>
  savingSection: string | null
  savedSection: string | null
  sectionError: string
  onDismissError: () => void
}) {
  const [basic, setBasic] = useState({
    name: profile.basic.name,
    title: profile.basic.title,
    introduction: profile.basic.introduction,
    aboutMe: profile.basic.aboutMe,
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [skills, setSkills] = useState(profile.professional.skills)
  const [technologies, setTechnologies] = useState(profile.professional.technologies)
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition>(
    profile.professional.currentPosition ?? {
      title: '',
      company: '',
      startDate: '',
      description: '',
    },
  )
  const [education, setEducation] = useState<EducationEntry[]>(
    profile.professional.education.length > 0
      ? profile.professional.education
      : [],
  )
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    profile.professional.experience.length > 0
      ? profile.professional.experience
      : [],
  )
  const [external, setExternal] = useState({
    linkedin: profile.external.linkedin ?? '',
    github: profile.external.github ?? '',
    twitter: profile.external.twitter ?? '',
    personalWebsite: profile.external.personalWebsite ?? '',
    portfolioWebsite: profile.external.portfolioWebsite ?? '',
  })
  const [aiSettings, setAiSettings] = useState({
    provider: profile.aiSettings.provider,
    apiKey: '',
    model: profile.aiSettings.model ?? '',
    baseUrl: profile.aiSettings.baseUrl ?? '',
  })
  const [visibility, setVisibility] = useState(profile.visibility)
  const [protectedPassword, setProtectedPassword] = useState('')

  const { updateProfile } = useProfileStore()

  return (
    <>
      {sectionError && (
        <ErrorBanner message={sectionError} onDismiss={onDismissError} />
      )}

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Image</h2>
        <ProfileImageUpload />
      </section>

      <Section
        title="Basic Info"
        onSave={() => onSaveSection('basic', () => updateProfile({ basic }))}
        saving={savingSection === 'basic'}
        saved={savedSection === 'basic'}
      >
        <label className="block text-sm font-medium text-gray-300">Full Name</label>
        <input
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          value={basic.name}
          onChange={(e) => setBasic({ ...basic, name: e.target.value })}
        />
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          value={basic.title}
          onChange={(e) => setBasic({ ...basic, title: e.target.value })}
        />
        <label className="block text-sm font-medium text-gray-300">Introduction</label>
        <textarea
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          rows={2}
          value={basic.introduction}
          onChange={(e) => setBasic({ ...basic, introduction: e.target.value })}
        />
        <label className="block text-sm font-medium text-gray-300">About Me</label>
        <textarea
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          rows={4}
          value={basic.aboutMe}
          onChange={(e) => setBasic({ ...basic, aboutMe: e.target.value })}
        />
      </Section>

      <Section
        title="Professional"
        onSave={() =>
          onSaveSection('professional', () =>
            updateProfile({
              professional: {
                skills,
                technologies,
                ...(currentPosition.title && currentPosition.company && currentPosition.startDate
                  ? { currentPosition }
                  : { currentPosition: null }),
                education,
                experience,
              },
            }),
          )
        }
        saving={savingSection === 'professional'}
        saved={savedSection === 'professional'}
      >
        <div className="space-y-3 rounded-lg border border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-300">Current Position</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Title</label>
              <input
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                value={currentPosition.title}
                onChange={(e) => setCurrentPosition({ ...currentPosition, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Company</label>
              <input
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                value={currentPosition.company}
                onChange={(e) => setCurrentPosition({ ...currentPosition, company: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Start Date</label>
              <input
                type="month"
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                value={currentPosition.startDate}
                onChange={(e) => setCurrentPosition({ ...currentPosition, startDate: e.target.value })}
              />
            </div>
          </div>
          <textarea
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
            rows={2}
            placeholder="Role description (optional)"
            value={currentPosition.description}
            onChange={(e) => setCurrentPosition({ ...currentPosition, description: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Education</h3>
            <button
              type="button"
              className="text-xs text-indigo-400 hover:text-indigo-300"
              onClick={() =>
                setEducation([
                  ...education,
                  {
                    institution: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: null,
                    description: '',
                  },
                ])
              }
            >
              + Add
            </button>
          </div>
          {education.map((entry, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-gray-700 p-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() => setEducation(education.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
              <input
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="Institution"
                value={entry.institution}
                onChange={(e) => {
                  const next = [...education]
                  next[index] = { ...entry, institution: e.target.value }
                  setEducation(next)
                }}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  placeholder="Degree"
                  value={entry.degree}
                  onChange={(e) => {
                    const next = [...education]
                    next[index] = { ...entry, degree: e.target.value }
                    setEducation(next)
                  }}
                />
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  placeholder="Field of study"
                  value={entry.field}
                  onChange={(e) => {
                    const next = [...education]
                    next[index] = { ...entry, field: e.target.value }
                    setEducation(next)
                  }}
                />
                <div className="space-y-1">
                  <label className="block text-xs text-gray-400">Start Date</label>
                  <input
                    type="month"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                    value={entry.startDate}
                    onChange={(e) => {
                      const next = [...education]
                      next[index] = { ...entry, startDate: e.target.value }
                      setEducation(next)
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-gray-400">End Date</label>
                  <input
                    type="month"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                    value={entry.endDate ?? ''}
                    onChange={(e) => {
                      const next = [...education]
                      next[index] = { ...entry, endDate: e.target.value || null }
                      setEducation(next)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Experience</h3>
            <button
              type="button"
              className="text-xs text-indigo-400 hover:text-indigo-300"
              onClick={() =>
                setExperience([
                  ...experience,
                  {
                    title: '',
                    company: '',
                    startDate: '',
                    endDate: null,
                    description: '',
                  },
                ])
              }
            >
              + Add
            </button>
          </div>
          {experience.map((entry, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-gray-700 p-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  placeholder="Title"
                  value={entry.title}
                  onChange={(e) => {
                    const next = [...experience]
                    next[index] = { ...entry, title: e.target.value }
                    setExperience(next)
                  }}
                />
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  placeholder="Company"
                  value={entry.company}
                  onChange={(e) => {
                    const next = [...experience]
                    next[index] = { ...entry, company: e.target.value }
                    setExperience(next)
                  }}
                />
                <div className="space-y-1">
                  <label className="block text-xs text-gray-400">Start Date</label>
                  <input
                    type="month"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                    value={entry.startDate}
                    onChange={(e) => {
                      const next = [...experience]
                      next[index] = { ...entry, startDate: e.target.value }
                      setExperience(next)
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-gray-400">End Date</label>
                  <input
                    type="month"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                    value={entry.endDate ?? ''}
                    onChange={(e) => {
                      const next = [...experience]
                      next[index] = { ...entry, endDate: e.target.value || null }
                      setExperience(next)
                    }}
                  />
                </div>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                rows={2}
                placeholder="Description (optional)"
                value={entry.description}
                onChange={(e) => {
                  const next = [...experience]
                  next[index] = { ...entry, description: e.target.value }
                  setExperience(next)
                }}
              />
            </div>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-300">Add skill (press Enter)</label>
        <input
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const v = skillsInput.trim()
              if (v && !skills.includes(v)) setSkills([...skills, v])
              setSkillsInput('')
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="rounded-full bg-indigo-600/20 px-3 py-1 text-xs text-indigo-300">
              {s}
              <button type="button" className="ml-1" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                ×
              </button>
            </span>
          ))}
        </div>
        <label className="block text-sm font-medium text-gray-300">Add technology (press Enter)</label>
        <input
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const v = techInput.trim()
              if (v && !technologies.includes(v)) setTechnologies([...technologies, v])
              setTechInput('')
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          {technologies.map((t) => (
            <span key={t} className="rounded-full bg-indigo-600/20 px-3 py-1 text-xs text-indigo-300">
              {t}
              <button type="button" className="ml-1" onClick={() => setTechnologies(technologies.filter((x) => x !== t))}>
                ×
              </button>
            </span>
          ))}
        </div>
      </Section>

      <Section
        title="External Links"
        onSave={() =>
          onSaveSection('external', () =>
            updateProfile({
              external: {
                linkedin: external.linkedin || null,
                github: external.github || null,
                twitter: external.twitter || null,
                personalWebsite: external.personalWebsite || null,
                portfolioWebsite: external.portfolioWebsite || null,
              },
            }),
          )
        }
        saving={savingSection === 'external'}
        saved={savedSection === 'external'}
      >
        {(['linkedin', 'github', 'twitter', 'personalWebsite'] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-sm font-medium text-gray-300 capitalize">{field}</label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
              value={external[field]}
              onChange={(e) => setExternal({ ...external, [field]: e.target.value })}
            />
          </div>
        ))}
      </Section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold mb-4">Resume</h2>
        <ResumeUpload />
      </section>

      <Section
        title="AI Settings"
        onSave={() =>
          onSaveSection('ai', () =>
            updateProfile({
              aiSettings: {
                provider: aiSettings.provider,
                model: aiSettings.model || null,
                baseUrl: aiSettings.baseUrl || null,
                ...(aiSettings.apiKey ? { apiKey: aiSettings.apiKey } : {}),
              },
            }),
          )
        }
        saving={savingSection === 'ai'}
        saved={savedSection === 'ai'}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.values(LlmProvider).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAiSettings({ ...aiSettings, provider: p })}
              className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                aiSettings.provider === p
                  ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                  : 'border-gray-600 text-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <label className="block text-sm font-medium text-gray-300">API Key</label>
        <input
          type="password"
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          value={aiSettings.apiKey}
          onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
          placeholder={
            profile.aiSettings.apiKeyConfigured
              ? 'Leave blank to keep existing key'
              : 'Enter your API key'
          }
        />
        <label className="block text-sm font-medium text-gray-300">Model</label>
        <input
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
          value={aiSettings.model}
          onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
        />
        {(aiSettings.provider === LlmProvider.OLLAMA ||
          aiSettings.provider === LlmProvider.CUSTOM) && (
          <>
            <label className="block text-sm font-medium text-gray-300">Base URL</label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
              value={aiSettings.baseUrl}
              onChange={(e) => setAiSettings({ ...aiSettings, baseUrl: e.target.value })}
            />
          </>
        )}
      </Section>

      <Section
        title="Visibility"
        onSave={() =>
          onSaveSection('visibility', () =>
            updateProfile({
              visibility: {
                visibility,
                ...(visibility === ProfileVisibility.PROTECTED && protectedPassword
                  ? { protectedPassword }
                  : {}),
              },
            }),
          )
        }
        saving={savingSection === 'visibility'}
        saved={savedSection === 'visibility'}
      >
        <div className="grid grid-cols-3 gap-3">
          {Object.values(ProfileVisibility).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                visibility === v
                  ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                  : 'border-gray-600 text-gray-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {visibility === ProfileVisibility.PROTECTED && (
          <>
            <label className="block text-sm font-medium text-gray-300">New portfolio password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
              value={protectedPassword}
              onChange={(e) => setProtectedPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
            />
          </>
        )}
      </Section>
    </>
  )
}

export default function EditProfile() {
  const navigate = useNavigate()
  const { profile, isLoading, error, fetchMyProfile, clearError } = useProfileStore()

  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [sectionError, setSectionError] = useState('')

  useEffect(() => {
    if (!profile) fetchMyProfile()
  }, [profile, fetchMyProfile])

  const saveSection = async (section: string, fn: () => Promise<void>) => {
    setSavingSection(section)
    setSectionError('')
    setSavedSection(null)
    try {
      await fn()
      setSavedSection(section)
      setTimeout(() => setSavedSection(null), 2000)
    } catch (err) {
      setSectionError(getApiErrorMessage(err))
    } finally {
      setSavingSection(null)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400">No profile found.</p>
          <Button className="mt-4" onClick={() => navigate('/onboarding')}>
            Create Profile
          </Button>
        </div>
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

      <div className="mx-auto max-w-2xl px-6 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="mt-1 text-sm text-gray-400">Update sections independently</p>
        </div>

        {error && (
          <ErrorBanner message={error} onDismiss={clearError} />
        )}

        <EditProfileForm
          key={profile.updatedAt}
          profile={profile}
          onSaveSection={saveSection}
          savingSection={savingSection}
          savedSection={savedSection}
          sectionError={sectionError}
          onDismissError={() => setSectionError('')}
        />
      </div>
    </div>
  )
}
