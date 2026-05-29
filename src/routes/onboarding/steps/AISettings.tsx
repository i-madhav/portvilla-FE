import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { profileService } from '@/services/profile.service'

export default function AISettings() {
  const navigate = useNavigate()
  const [provider, setProvider] = useState<'openai' | 'groq' | 'ollama' | 'custom'>('openai')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const modelPlaceholders: Record<string, string> = {
    openai: 'gpt-4o',
    groq: 'mixtral-8x7b-32768',
    ollama: 'llama3',
    custom: 'your-model-name',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Gather all onboarding data
      const basic = JSON.parse(sessionStorage.getItem('onboarding_basic') || '{}')
      const professional = JSON.parse(sessionStorage.getItem('onboarding_professional') || '{}')
      const external = JSON.parse(sessionStorage.getItem('onboarding_external') || '{}')

      await profileService.create({
        basic: {
          name: basic.name,
          title: basic.title,
          introduction: basic.introduction,
          aboutMe: basic.aboutMe,
        },
        professional: {
          currentPosition: {
            title: professional.currentTitle,
            company: professional.currentCompany,
            startDate: '',
            description: '',
          },
          skills: professional.skills ? professional.skills.split(',').map((s: string) => s.trim()) : [],
          technologies: professional.technologies ? professional.technologies.split(',').map((t: string) => t.trim()) : [],
          education: [],
          experience: [],
          interests: [],
          achievements: [],
          certifications: [],
          awards: [],
          additionalNotes: '',
        },
        external: {
          linkedin: external.linkedin,
          github: external.github,
          twitter: external.twitter,
          personalWebsite: external.personalWebsite,
          researchPapers: [],
          projects: [],
          blogs: [],
          otherProfiles: [],
        },
        aiSettings: {
          provider,
          apiKey: apiKey || undefined,
          model: model || modelPlaceholders[provider],
        },
      })

      sessionStorage.removeItem('onboarding_basic')
      sessionStorage.removeItem('onboarding_professional')
      sessionStorage.removeItem('onboarding_external')

      navigate('/onboarding/complete')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">AI Configuration</h2>
        <p className="mt-1 text-sm text-gray-400">
          Configure the AI that will represent you. Your API key stays encrypted.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">AI Provider</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['openai', 'groq', 'ollama', 'custom'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                provider === p
                  ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {provider !== 'ollama' && (
        <Input
          label="API Key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={provider === 'custom' ? 'Your custom API key' : 'sk-...'}
        />
      )}

      <Input
        label="Model (optional)"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        placeholder={modelPlaceholders[provider]}
      />

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => navigate('/onboarding/external-sources')}>
          Back
        </Button>
        <Button type="submit" isLoading={loading}>
          Complete Setup
        </Button>
      </div>
    </form>
  )
}
