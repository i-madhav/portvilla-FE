import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { step2Schema, type Step2Values } from '@/schemas/profile.schemas'
import { useOnboardingStore } from '@/stores/onboardingStore'

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-600/20 px-3 py-1 text-xs text-indigo-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-indigo-400 hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(input)
          }
        }}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <p className="text-xs text-gray-500">Press Enter or comma to add</p>
    </div>
  )
}

function FieldArraySection({
  title,
  onAdd,
  children,
}: {
  title: string
  onAdd: () => void
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          + Add
        </button>
      </div>
      {children}
    </section>
  )
}

const emptyStep2: Step2Values = {
  currentPosition: { title: '', company: '', startDate: '', description: '' },
  education: [],
  experience: [],
  skills: [],
  technologies: [],
}

export default function ProfessionalInfo() {
  const navigate = useNavigate()
  const { step2, setStep2 } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2 ?? emptyStep2,
  })

  const skills = watch('skills')
  const technologies = watch('technologies')

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: 'education' })

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: 'experience' })

  const onSubmit = (data: Step2Values) => {
    setStep2(data)
    navigate('/onboarding/external-sources')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Professional Information</h2>
        <p className="mt-1 text-sm text-gray-400">Your career highlights — all fields are optional</p>
      </div>

      <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <h3 className="text-sm font-medium text-gray-300">Current Position</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            {...register('currentPosition.title')}
            placeholder="Senior Engineer"
            error={errors.currentPosition?.title?.message}
          />
          <Input
            label="Company"
            {...register('currentPosition.company')}
            placeholder="Acme Corp"
            error={errors.currentPosition?.company?.message}
          />
          <Input
            label="Start Date"
            type="month"
            {...register('currentPosition.startDate')}
            error={errors.currentPosition?.startDate?.message}
          />
        </div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          {...register('currentPosition.description')}
          rows={2}
          placeholder="Brief summary of your role (optional)"
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </section>

      <FieldArraySection
        title="Education"
        onAdd={() =>
          appendEducation({
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            description: '',
          })
        }
      >
        {educationFields.length === 0 && (
          <p className="text-xs text-gray-500">No education entries yet.</p>
        )}
        {educationFields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <Input
              label="Institution"
              {...register(`education.${index}.institution`)}
              error={errors.education?.[index]?.institution?.message}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Degree"
                {...register(`education.${index}.degree`)}
                error={errors.education?.[index]?.degree?.message}
              />
              <Input
                label="Field of Study"
                {...register(`education.${index}.field`)}
                error={errors.education?.[index]?.field?.message}
              />
              <Input
                label="Start Date"
                type="month"
                {...register(`education.${index}.startDate`)}
                error={errors.education?.[index]?.startDate?.message}
              />
              <Input
                label="End Date"
                type="month"
                {...register(`education.${index}.endDate`)}
                error={errors.education?.[index]?.endDate?.message}
              />
            </div>
            <textarea
              {...register(`education.${index}.description`)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </FieldArraySection>

      <FieldArraySection
        title="Experience"
        onAdd={() =>
          appendExperience({
            title: '',
            company: '',
            startDate: '',
            endDate: '',
            description: '',
          })
        }
      >
        {experienceFields.length === 0 && (
          <p className="text-xs text-gray-500">No experience entries yet.</p>
        )}
        {experienceFields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Title"
                {...register(`experience.${index}.title`)}
                error={errors.experience?.[index]?.title?.message}
              />
              <Input
                label="Company"
                {...register(`experience.${index}.company`)}
                error={errors.experience?.[index]?.company?.message}
              />
              <Input
                label="Start Date"
                type="month"
                {...register(`experience.${index}.startDate`)}
                error={errors.experience?.[index]?.startDate?.message}
              />
              <Input
                label="End Date"
                type="month"
                {...register(`experience.${index}.endDate`)}
                error={errors.experience?.[index]?.endDate?.message}
              />
            </div>
            <textarea
              {...register(`experience.${index}.description`)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </FieldArraySection>

      <TagInput
        label="Skills"
        value={skills}
        onChange={(tags) => setValue('skills', tags)}
        placeholder="React, TypeScript, Node.js"
      />

      <TagInput
        label="Technologies"
        value={technologies}
        onChange={(tags) => setValue('technologies', tags)}
        placeholder="AWS, Docker, Kubernetes"
      />

      <div className="flex justify-between">
        <Button variant="ghost" type="button" onClick={() => navigate('/onboarding/basic-info')}>
          Back
        </Button>
        <Button type="submit">Next: External Sources</Button>
      </div>
    </form>
  )
}
