import { Fragment } from 'react'

interface TimelineItem {
  type: 'education' | 'experience'
  title: string
  subtitle: string
  startDate: string
  endDate: string | null
  description: string
}

interface TimelineSectionProps {
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string | null
    description: string
  }>
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate: string | null
    description: string
  }>
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function TimelineSection({ education, experience }: TimelineSectionProps) {
  const items: TimelineItem[] = [
    ...education.map((e) => ({
      type: 'education' as const,
      title: `${e.degree} in ${e.field}`,
      subtitle: e.institution,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
    })),
    ...experience.map((e) => ({
      type: 'experience' as const,
      title: e.title,
      subtitle: e.company,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
    })),
  ].sort((a, b) => {
    const aDate = a.endDate || a.startDate || ''
    const bDate = b.endDate || b.startDate || ''
    return bDate.localeCompare(aDate)
  })

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Timeline</h2>
      <div className="relative space-y-6">
        {items.map((item, i) => (
          <Fragment key={`${item.type}-${i}`}>
            {i > 0 && <div className="absolute left-3 top-0 h-full w-px bg-gray-700" />}
            <div className="relative pl-8">
              <div className={`absolute left-[7px] top-1.5 h-3 w-3 rounded-full border-2 ${
                item.type === 'education'
                  ? 'border-indigo-500 bg-indigo-900'
                  : 'border-green-500 bg-green-900'
              }`} />
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(item.startDate)} – {item.endDate ? formatDate(item.endDate) : 'Present'}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-gray-300">{item.description}</p>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
