import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-indigo-400">PortVilla</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-24 pb-32 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Your AI-Powered
          <span className="block text-indigo-400">Interactive Portfolio</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-400">
          Onboard once, get a shareable URL. Visitors interact with an AI assistant that knows your
          professional story — grounded in your data.
        </p>
        <div className="mt-10 flex gap-4">
          <Link to="/register">
            <Button size="lg">Create Your Portfolio</Button>
          </Link>
          <Link to="/demo">
            <Button variant="secondary" size="lg">See a Demo</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-8 px-6 pb-32 md:grid-cols-3 max-w-5xl mx-auto">
        {[
          {
            title: 'Voice-First Interaction',
            desc: 'Visitors speak naturally with an AI orb that answers questions about your career.',
          },
          {
            title: 'Grounded in Your Data',
            desc: 'No hallucinations — the AI only uses the professional data you submit.',
          },
          {
            title: 'Shareable URL',
            desc: 'Get a portvilla.in/username link. Share it anywhere — resumes, LinkedIn, email.',
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
