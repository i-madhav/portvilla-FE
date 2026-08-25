import { apiClient } from '@app/lib/api';
import type {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpResponse,
  VerifyOtpPayload,
  ResendOtpResponse,
  ResendOtpPayload,
  LoginWithOtpResponse,
  LoginWithOtpPayload,
  ProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  TokenResponse,
} from '@typings/authApi';

// ─── Unauthenticated endpoints ───────────────────────────────────────────────

/** Register a new user */
export function register(req: RegisterRequest): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>('/auth/register', req);
}

/** Verify email via OTP */
export function verifyEmail(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  return apiClient.post<VerifyOtpResponse>('/auth/verify-email', payload);
}

/** Resend verification OTP */
export function resendOtp(payload: ResendOtpPayload): Promise<ResendOtpResponse> {
  return apiClient.post<ResendOtpResponse>('/auth/resend-otp', payload);
}

/** Password login */
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', { email, password });
}

/** Request an OTP for passwordless login */
export function requestLoginOtp(email: string): Promise<ResendOtpResponse> {
  return apiClient.post<ResendOtpResponse>('/auth/login/otp/request', { email });
}

/** Complete OTP-based login */
export function loginWithOtp(payload: LoginWithOtpPayload): Promise<LoginWithOtpResponse> {
  return apiClient.post<LoginWithOtpResponse>('/auth/login/otp', payload);
}

/** Refresh token pair using the refresh token */
export function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return apiClient.post<TokenResponse>('/auth/refresh', { refreshToken });
}

// ─── Authenticated endpoints ─────────────────────────────────────────────────

/** Get the current user's profile */
export function getProfile(): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>('/auth/profile', true);
}

/** Change the current user's password */
export function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  return apiClient.post<ChangePasswordResponse>('/auth/change-password', payload, true);
}

/** Log out on the server side */
export function logout(): Promise<void> {
  return apiClient.post<void>('/auth/logout', undefined, true);
}
