interface ProjectsSectionProps {
  projects: Array<{
    name: string
    url?: string
    description: string
    technologies: string[]
  }>
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.name} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="font-medium text-white">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                  {project.name}
                </a>
              ) : (
                project.name
              )}
            </h3>
            <p className="mt-1 text-sm text-gray-400">{project.description}</p>
            {project.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full bg-gray-700/40 px-2 py-0.5 text-xs text-gray-300">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
