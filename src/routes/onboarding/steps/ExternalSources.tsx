import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { step3Schema, type Step3Values } from '@/schemas/profile.schemas'
import { useOnboardingStore } from '@/stores/onboardingStore'

export default function ExternalSources() {
  const navigate = useNavigate()
  const { step3, setStep3 } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: step3 ?? {
      linkedin: null,
      github: null,
      twitter: null,
      personalWebsite: null,
      portfolioWebsite: null,
    },
  })

  const onSubmit = (data: Step3Values) => {
    setStep3(data)
    navigate('/onboarding/ai-settings')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">External Sources</h2>
        <p className="mt-1 text-sm text-gray-400">Link your professional profiles (all optional)</p>
      </div>

      <Input
        label="LinkedIn URL"
        type="url"
        {...register('linkedin')}
        placeholder="https://linkedin.com/in/your-profile"
        error={errors.linkedin?.message}
      />
      <Input
        label="GitHub URL"
        type="url"
        {...register('github')}
        placeholder="https://github.com/your-username"
        error={errors.github?.message}
      />
      <Input
        label="Twitter / X URL"
        type="url"
        {...register('twitter')}
        placeholder="https://x.com/your-handle"
        error={errors.twitter?.message}
      />
      <Input
        label="Personal Website"
        type="url"
        {...register('personalWebsite')}
        placeholder="https://yoursite.com"
        error={errors.personalWebsite?.message}
      />
      <Input
        label="Portfolio Website"
        type="url"
        {...register('portfolioWebsite')}
        placeholder="https://portfolio.yoursite.com"
        error={errors.portfolioWebsite?.message}
      />

      <div className="flex justify-between">
        <Button variant="ghost" type="button" onClick={() => navigate('/onboarding/professional-info')}>
          Back
        </Button>
        <Button type="submit">Next: AI Settings</Button>
      </div>
    </form>
  )
}
