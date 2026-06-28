// ─── Auth API response / request types ───────────────────────────────────────

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginResponse = TokenResponse;

export interface RegisterRequest {
  email: string;
  password: string;
}

export type RegisterResponse = MessageResponse;

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export type VerifyOtpResponse = MessageResponse;

export interface ResendOtpPayload {
  email: string;
}

export type ResendOtpResponse = MessageResponse;

export interface LoginWithOtpPayload {
  email: string;
  otp: string;
}

export type LoginWithOtpResponse = TokenResponse;

export interface ProfileResponse {
  id: string;
  email: string;
  name?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}
