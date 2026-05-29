import { Routes, Route } from 'react-router-dom'
import LandingPage from '@/routes/LandingPage'
import Login from '@/routes/auth/Login'
import Register from '@/routes/auth/Register'
import VerifyEmail from '@/routes/auth/VerifyEmail'
import OnboardingLayout from '@/routes/onboarding/OnboardingLayout'
import BasicInfo from '@/routes/onboarding/steps/BasicInfo'
import ProfessionalInfo from '@/routes/onboarding/steps/ProfessionalInfo'
import ExternalSources from '@/routes/onboarding/steps/ExternalSources'
import AISettings from '@/routes/onboarding/steps/AISettings'
import OnboardingComplete from '@/routes/onboarding/OnboardingComplete'
import CandidateSettings from '@/routes/candidate/CandidateSettings'
import EditProfile from '@/routes/candidate/EditProfile'
import PortfolioView from '@/routes/portfolio/[username]/PortfolioView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/onboarding" element={<OnboardingLayout />}>
        <Route index element={<BasicInfo />} />
        <Route path="basic-info" element={<BasicInfo />} />
        <Route path="professional-info" element={<ProfessionalInfo />} />
        <Route path="external-sources" element={<ExternalSources />} />
        <Route path="ai-settings" element={<AISettings />} />
      </Route>
      <Route path="/onboarding/complete" element={<OnboardingComplete />} />
      <Route path="/settings" element={<CandidateSettings />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/:username" element={<PortfolioView />} />
    </Routes>
  )
}
