interface SocialLinksProps {
  linkedin?: string
  github?: string
  twitter?: string
  personalWebsite?: string
}

export default function SocialLinks({ linkedin, github, twitter, personalWebsite }: SocialLinksProps) {
  const links = [
    { label: 'LinkedIn', url: linkedin, icon: 'in' },
    { label: 'GitHub', url: github, icon: 'gh' },
    { label: 'Twitter', url: twitter, icon: '𝕏' },
    { label: 'Website', url: personalWebsite, icon: '🔗' },
  ].filter((l) => l.url)

  if (links.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Links</h2>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:border-indigo-500 hover:text-indigo-300 transition-colors"
          >
            <span>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
