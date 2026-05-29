export interface MessageResponse {
  message: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface SendOtpPayload {
  email: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: 'user' | 'admin'
}
