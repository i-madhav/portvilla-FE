import { Outlet, useLocation } from 'react-router-dom'

const steps = [
  { path: 'basic-info', label: 'Basic Info' },
  { path: 'professional-info', label: 'Professional' },
  { path: 'external-sources', label: 'External' },
  { path: 'ai-settings', label: 'AI Settings' },
  { path: 'review', label: 'Review' },
]

export default function OnboardingLayout() {
  const location = useLocation()
  const currentPath = location.pathname.split('/').pop() || 'basic-info'
  const currentIndex = steps.findIndex((s) => s.path === currentPath)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.path} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  i <= currentIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden text-sm sm:block ${
                  i <= currentIndex ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`ml-2 h-px w-6 transition-colors sm:w-8 ${
                    i < currentIndex ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <Outlet />
      </div>
    </div>
  )
}
