import { ApiClient, authenticatedAuthClient } from '../lib/api-client'
import type {
  MessageResponse,
  RegisterPayload,
  SendOtpPayload,
  TokenResponse,
  VerifyOtpPayload,
  LoginPayload,
  RefreshTokenPayload,
} from '../types/auth'

class AuthService extends ApiClient {
  constructor() {
    super('/auth')
  }

  register(payload: RegisterPayload) {
    return this.post<MessageResponse>('/register', payload)
  }

  verifyEmail(payload: VerifyOtpPayload) {
    return this.post<MessageResponse>('/verify-email', payload)
  }

  resendOtp(payload: SendOtpPayload) {
    return this.post<MessageResponse>('/resend-otp', payload)
  }

  login(payload: LoginPayload) {
    return this.post<TokenResponse>('/login', payload)
  }

  requestLoginOtp(payload: SendOtpPayload) {
    return this.post<MessageResponse>('/login/otp/request', payload)
  }

  loginWithOtp(payload: VerifyOtpPayload) {
    return this.post<TokenResponse>('/login/otp', payload)
  }

  refresh(payload: RefreshTokenPayload) {
    return this.post<TokenResponse>('/refresh', payload)
  }

  logout() {
    return authenticatedAuthClient.post<MessageResponse>('/logout')
  }
}

export const authService = new AuthService()
