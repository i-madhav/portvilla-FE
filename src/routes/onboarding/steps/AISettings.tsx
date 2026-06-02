import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { step4Schema, type Step4Values } from '@/schemas/profile.schemas'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { LlmProvider } from '@/types/profile'

const MODEL_PLACEHOLDERS: Record<LlmProvider, string> = {
  [LlmProvider.OPENAI]: 'gpt-4o',
  [LlmProvider.GROQ]: 'mixtral-8x7b-32768',
  [LlmProvider.OLLAMA]: 'llama3',
  [LlmProvider.CUSTOM]: 'your-model-name',
}

export default function AISettings() {
  const navigate = useNavigate()
  const { step4, setStep4 } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: step4 ?? {
      provider: LlmProvider.OPENAI,
      apiKey: '',
      model: '',
      baseUrl: '',
    },
  })

  const provider = watch('provider')
  const needsBaseUrl = provider === LlmProvider.OLLAMA || provider === LlmProvider.CUSTOM
  const needsApiKey = provider !== LlmProvider.OLLAMA

  const onSubmit = (data: Step4Values) => {
    setStep4(data)
    navigate('/onboarding/review')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">AI Configuration</h2>
        <p className="mt-1 text-sm text-gray-400">
          Configure the AI that will represent you. Your API key stays encrypted on the server.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">AI Provider</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.values(LlmProvider).map((p) => (
            <label
              key={p}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium capitalize transition-colors ${
                provider === p
                  ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              <input type="radio" value={p} {...register('provider')} className="sr-only" />
              {p}
            </label>
          ))}
        </div>
      </div>

      {needsApiKey && (
        <Input
          label="API Key"
          type="password"
          {...register('apiKey')}
          placeholder={provider === LlmProvider.CUSTOM ? 'Your custom API key' : 'sk-...'}
          error={errors.apiKey?.message}
        />
      )}

      {needsBaseUrl && (
        <Input
          label="Base URL"
          type="url"
          {...register('baseUrl')}
          placeholder="http://localhost:11434"
          error={errors.baseUrl?.message}
        />
      )}

      <Input
        label="Model (optional)"
        {...register('model')}
        placeholder={MODEL_PLACEHOLDERS[provider]}
        error={errors.model?.message}
      />

      <div className="flex justify-between">
        <Button variant="ghost" type="button" onClick={() => navigate('/onboarding/external-sources')}>
          Back
        </Button>
        <Button type="submit">Next: Review</Button>
      </div>
    </form>
  )
}
