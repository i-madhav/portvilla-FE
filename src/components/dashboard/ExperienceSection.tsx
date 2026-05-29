interface ExperienceSectionProps {
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate: string
    description: string
  }>
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
  if (experience.length === 0) return null

  const sorted = [...experience].sort((a, b) => {
    const aDate = a.endDate || a.startDate || ''
    const bDate = b.endDate || b.startDate || ''
    return bDate.localeCompare(aDate)
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Experience</h2>
      <div className="space-y-4">
        {sorted.map((exp, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-white">{exp.title}</h3>
                <p className="text-sm text-gray-400">{exp.company}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : 'Present'}
              </span>
            </div>
            {exp.description && (
              <p className="mt-2 text-sm text-gray-300">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
