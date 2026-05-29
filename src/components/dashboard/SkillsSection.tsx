interface SkillsSectionProps {
  skills: string[]
  technologies: string[]
}

export default function SkillsSection({ skills, technologies }: SkillsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Skills & Technologies</h2>

      {skills.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-gray-400">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {technologies.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-gray-400">Technologies</p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span key={tech} className="rounded-full bg-gray-700/50 px-3 py-1 text-xs font-medium text-gray-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
