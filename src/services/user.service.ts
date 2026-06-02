import { AuthenticatedApiClient } from '@/lib/api-client'
import type { UserAccount } from '@/types/user'

class UserService extends AuthenticatedApiClient {
  constructor() {
    super('/users')
  }

  getMe() {
    return this.get<UserAccount>('/me')
  }
}

export const userService = new UserService()
