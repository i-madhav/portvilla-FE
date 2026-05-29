import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'

export default function ExternalSources() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    personalWebsite: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.setItem('onboarding_external', JSON.stringify(form))
    navigate('/onboarding/ai-settings')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">External Sources</h2>
        <p className="mt-1 text-sm text-gray-400">Link your professional profiles</p>
      </div>

      <Input
        label="LinkedIn URL"
        type="url"
        value={form.linkedin}
        onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
        placeholder="https://linkedin.com/in/your-profile"
      />
      <Input
        label="GitHub URL"
        type="url"
        value={form.github}
        onChange={(e) => setForm({ ...form, github: e.target.value })}
        placeholder="https://github.com/your-username"
      />
      <Input
        label="Twitter / X URL"
        type="url"
        value={form.twitter}
        onChange={(e) => setForm({ ...form, twitter: e.target.value })}
        placeholder="https://x.com/your-handle"
      />
      <Input
        label="Personal Website"
        type="url"
        value={form.personalWebsite}
        onChange={(e) => setForm({ ...form, personalWebsite: e.target.value })}
        placeholder="https://yoursite.com"
      />

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => navigate('/onboarding/professional-info')}>
          Back
        </Button>
        <Button type="submit">Next: AI Settings</Button>
      </div>
    </form>
  )
}
