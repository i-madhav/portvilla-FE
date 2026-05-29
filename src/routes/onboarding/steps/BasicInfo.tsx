import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'

export default function BasicInfo() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    title: '',
    introduction: '',
    aboutMe: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store in session/local state for later submission
    sessionStorage.setItem('onboarding_basic', JSON.stringify(form))
    navigate('/onboarding/professional-info')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-400">Tell us who you are</p>
      </div>

      <Input
        label="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Jane Doe"
        required
      />
      <Input
        label="Professional Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Senior Software Engineer"
        required
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">Short Introduction</label>
        <textarea
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={2}
          value={form.introduction}
          onChange={(e) => setForm({ ...form, introduction: e.target.value })}
          placeholder="A brief tagline about yourself"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">About Me</label>
        <textarea
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          value={form.aboutMe}
          onChange={(e) => setForm({ ...form, aboutMe: e.target.value })}
          placeholder="Tell your professional story..."
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next: Professional Info</Button>
      </div>
    </form>
  )
}
