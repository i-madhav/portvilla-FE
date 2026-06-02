import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { OnboardingProfileGuard } from '@/components/OnboardingProfileGuard'
import LandingPage from '@/routes/LandingPage'
import RegisterPage from '@/routes/auth/Register'
import VerifyEmailPage from '@/routes/auth/VerifyEmail'
import LoginPage from '@/routes/auth/Login'
import LoginOtpRequestPage from '@/routes/auth/LoginOtpRequestPage'
import LoginOtpVerifyPage from '@/routes/auth/LoginOtpVerifyPage'
import OnboardingLayout from '@/routes/onboarding/OnboardingLayout'
import BasicInfo from '@/routes/onboarding/steps/BasicInfo'
import ProfessionalInfo from '@/routes/onboarding/steps/ProfessionalInfo'
import ExternalSources from '@/routes/onboarding/steps/ExternalSources'
import AISettings from '@/routes/onboarding/steps/AISettings'
import ReviewVisibility from '@/routes/onboarding/steps/ReviewVisibility'
import OnboardingComplete from '@/routes/onboarding/OnboardingComplete'
import CandidateSettings from '@/routes/candidate/CandidateSettings'
import EditProfile from '@/routes/candidate/EditProfile'
import PortfolioView from '@/routes/portfolio/[username]/PortfolioView'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/otp" element={<LoginOtpRequestPage />} />
        <Route path="/login/otp/verify" element={<LoginOtpVerifyPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingProfileGuard>
                <OnboardingLayout />
              </OnboardingProfileGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<BasicInfo />} />
          <Route path="basic-info" element={<BasicInfo />} />
          <Route path="professional-info" element={<ProfessionalInfo />} />
          <Route path="external-sources" element={<ExternalSources />} />
          <Route path="ai-settings" element={<AISettings />} />
          <Route path="review" element={<ReviewVisibility />} />
        </Route>
        <Route path="/onboarding/complete" element={<OnboardingComplete />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <CandidateSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/:username" element={<PortfolioView />} />
      </Routes>
    </AuthProvider>
  )
}
