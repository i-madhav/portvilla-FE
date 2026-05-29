import type { RouteObject } from 'react-router-dom'

export const routes: RouteObject[] = [
  { path: '/', lazy: () => import('@/routes/LandingPage') },
  { path: '/login', lazy: () => import('@/routes/auth/Login') },
  { path: '/register', lazy: () => import('@/routes/auth/Register') },
  { path: '/verify-email', lazy: () => import('@/routes/auth/VerifyEmail') },
  {
    path: '/onboarding',
    lazy: () => import('@/routes/onboarding/OnboardingLayout'),
    children: [
      { index: true, lazy: () => import('@/routes/onboarding/steps/BasicInfo') },
      { path: 'basic-info', lazy: () => import('@/routes/onboarding/steps/BasicInfo') },
      { path: 'professional-info', lazy: () => import('@/routes/onboarding/steps/ProfessionalInfo') },
      { path: 'external-sources', lazy: () => import('@/routes/onboarding/steps/ExternalSources') },
      { path: 'ai-settings', lazy: () => import('@/routes/onboarding/steps/AISettings') },
    ],
  },
  { path: '/onboarding/complete', lazy: () => import('@/routes/onboarding/OnboardingComplete') },
  { path: '/settings', lazy: () => import('@/routes/candidate/CandidateSettings') },
  { path: '/edit-profile', lazy: () => import('@/routes/candidate/EditProfile') },
  { path: '/:username', lazy: () => import('@/routes/portfolio/[username]/PortfolioView') },
]
