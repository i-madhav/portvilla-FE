import { apiClient } from '../lib/api-client'
import type {
  MessageResponse,
  RegisterPayload,
  SendOtpPayload,
  TokenResponse,
  VerifyOtpPayload,
  LoginPayload,
  RefreshTokenPayload,
} from '../types/auth'

export const authService = {
  register(payload: RegisterPayload) {
    return apiClient<MessageResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })
  },

  verifyEmail(payload: VerifyOtpPayload) {
    return apiClient<MessageResponse>('/auth/verify-email', {
      method: 'POST',
      body: payload,
    })
  },

  resendOtp(payload: SendOtpPayload) {
    return apiClient<MessageResponse>('/auth/resend-otp', {
      method: 'POST',
      body: payload,
    })
  },

  login(payload: LoginPayload) {
    return apiClient<TokenResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
  },

  requestLoginOtp(payload: SendOtpPayload) {
    return apiClient<MessageResponse>('/auth/login/otp/request', {
      method: 'POST',
      body: payload,
    })
  },

  loginWithOtp(payload: VerifyOtpPayload) {
    return apiClient<TokenResponse>('/auth/login/otp', {
      method: 'POST',
      body: payload,
    })
  },

  refresh(payload: RefreshTokenPayload) {
    return apiClient<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: payload,
    })
  },

  logout(accessToken: string) {
    return apiClient<MessageResponse>('/auth/logout', {
      method: 'POST',
      token: accessToken,
    })
  },
}
