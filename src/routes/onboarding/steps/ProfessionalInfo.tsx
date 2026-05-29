import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'

export default function ProfessionalInfo() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    currentTitle: '',
    currentCompany: '',
    skills: '',
    technologies: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.setItem('onboarding_professional', JSON.stringify(form))
    navigate('/onboarding/external-sources')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Professional Information</h2>
        <p className="mt-1 text-sm text-gray-400">Your career highlights</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Current Position Title"
          value={form.currentTitle}
          onChange={(e) => setForm({ ...form, currentTitle: e.target.value })}
          placeholder="Senior Engineer"
        />
        <Input
          label="Current Company"
          value={form.currentCompany}
          onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
          placeholder="Acme Corp"
        />
      </div>

      <Input
        label="Skills (comma-separated)"
        value={form.skills}
        onChange={(e) => setForm({ ...form, skills: e.target.value })}
        placeholder="React, TypeScript, Node.js, Python"
      />

      <Input
        label="Technologies (comma-separated)"
        value={form.technologies}
        onChange={(e) => setForm({ ...form, technologies: e.target.value })}
        placeholder="AWS, Docker, Kubernetes, PostgreSQL"
      />

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => navigate('/onboarding/basic-info')}>
          Back
        </Button>
        <Button type="submit">Next: External Sources</Button>
      </div>
    </form>
  )
}
