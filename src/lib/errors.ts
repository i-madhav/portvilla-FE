import { ApiError } from './api-client'

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof ApiError) {
    return err.message || fallback
  }
  if (err instanceof Error) {
    return err.message || fallback
  }
  return fallback
}
