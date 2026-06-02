export type UserRole = 'user' | 'admin'

/** Account record from GET /users/me — not portfolio data. */
export interface UserAccount {
  id: string
  email: string
  role: UserRole
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}
