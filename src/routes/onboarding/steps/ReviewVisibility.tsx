import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { step5Schema, type Step5Values } from '@/schemas/profile.schemas'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useProfileStore } from '@/stores/profileStore'
import { ProfileVisibility } from '@/types/profile'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/errors'

export default function ReviewVisibility() {
  const navigate = useNavigate()
  const { step1, step2, step4, setStep5, buildCreatePayload, reset, setUsernameConflictError } =
    useOnboardingStore()
  const { createProfile, fetchMyProfile } = useProfileStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step5Values>({
    resolver: zodResolver(step5Schema),
    defaultValues: { visibility: ProfileVisibility.PUBLIC },
  })

  const visibility = watch('visibility')

  if (!step1) {
    navigate('/onboarding/basic-info', { replace: true })
    return null
  }

  const onSubmit = async (data: Step5Values) => {
    setLoading(true)
    setError('')
    setStep5(data)

    try {
      const payload = buildCreatePayload()
      await createProfile(payload)
      reset()
      navigate('/settings', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        await fetchMyProfile()
        const existingProfile = useProfileStore.getState().profile
        if (existingProfile) {
          reset()
          navigate('/settings', { replace: true })
          return
        }
        setUsernameConflictError(getApiErrorMessage(err, 'That username is not available.'))
        navigate('/onboarding/basic-info')
        return
      }
      setError(getApiErrorMessage(err, 'Failed to create profile.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & Visibility</h2>
        <p className="mt-1 text-sm text-gray-400">Confirm your details and choose who can view your portfolio</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3 text-sm">
        <div>
          <span className="text-gray-500">Username:</span>{' '}
          <span className="text-white">@{step1.username}</span>
        </div>
        <div>
          <span className="text-gray-500">Name:</span>{' '}
          <span className="text-white">{step1.name}</span>
        </div>
        <div>
          <span className="text-gray-500">Title:</span>{' '}
          <span className="text-white">{step1.title}</span>
        </div>
        {step2 && (
          <>
            {step2.currentPosition?.title && (
              <div>
                <span className="text-gray-500">Current role:</span>{' '}
                <span className="text-white">
                  {step2.currentPosition.title} at {step2.currentPosition.company}
                  {step2.currentPosition.startDate
                    ? ` (since ${step2.currentPosition.startDate})`
                    : ''}
                </span>
              </div>
            )}
            {(step2.skills.length > 0 || step2.technologies.length > 0) && (
              <div>
                <span className="text-gray-500">Skills:</span>{' '}
                <span className="text-white">{step2.skills.join(', ') || '—'}</span>
              </div>
            )}
          </>
        )}
        {step4 && (
          <div>
            <span className="text-gray-500">AI Provider:</span>{' '}
            <span className="text-white capitalize">{step4.provider}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Portfolio Visibility</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { value: ProfileVisibility.PUBLIC, label: 'Public', desc: 'Anyone with the link' },
              { value: ProfileVisibility.PRIVATE, label: 'Private', desc: 'Only you' },
              { value: ProfileVisibility.PROTECTED, label: 'Protected', desc: 'Password required' },
            ] as const
          ).map(({ value, label, desc }) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                visibility === value
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <input type="radio" value={value} {...register('visibility')} className="sr-only" />
              <p className="font-medium text-white">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </label>
          ))}
        </div>
      </div>

      {visibility === ProfileVisibility.PROTECTED && (
        <Input
          label="Portfolio Password"
          type="password"
          {...register('protectedPassword')}
          placeholder="Minimum 6 characters"
          error={errors.protectedPassword?.message}
        />
      )}

      <div className="flex justify-between">
        <Button variant="ghost" type="button" onClick={() => navigate('/onboarding/ai-settings')}>
          Back
        </Button>
        <Button type="submit" isLoading={loading}>
          Create Portfolio
        </Button>
      </div>
    </form>
  )
}
