import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { step1Schema, type Step1Values } from '@/schemas/profile.schemas'
import { useOnboardingStore } from '@/stores/onboardingStore'

export default function BasicInfo() {
  const navigate = useNavigate()
  const { step1, usernameConflictError, setStep1 } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1 ?? {
      username: '',
      name: '',
      title: '',
      introduction: '',
      aboutMe: '',
    },
  })

  const username = watch('username')

  const onSubmit = (data: Step1Values) => {
    setStep1(data)
    navigate('/onboarding/professional-info')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-400">Tell us who you are</p>
      </div>

      {usernameConflictError && (
        <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
          {usernameConflictError}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">
          Username <span className="text-gray-500">(your portvilla.in/username)</span>
        </label>
        <input
          {...register('username')}
          placeholder="jane-doe"
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {username && !errors.username && (
          <p className="text-xs text-gray-500">
            Preview: {window.location.host}/{username}
          </p>
        )}
        {errors.username && (
          <p className="text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      <Input
        label="Full Name"
        {...register('name')}
        placeholder="Jane Doe"
        error={errors.name?.message}
      />
      <Input
        label="Professional Title"
        {...register('title')}
        placeholder="Senior Software Engineer"
        error={errors.title?.message}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">Short Introduction</label>
        <textarea
          {...register('introduction')}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={2}
          placeholder="A brief tagline about yourself"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">About Me</label>
        <textarea
          {...register('aboutMe')}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          placeholder="Tell your professional story..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next: Professional Info</Button>
      </div>
    </form>
  )
}
