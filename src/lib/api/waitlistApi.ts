import { apiClient } from './http';
import type { RequestOptions } from './http';

/** Adds an email to the waitlist. Throws ApiError 409 when already signed up. */
export function submitWaitlist(email: string, options?: RequestOptions): Promise<void> {
  return apiClient.post<void>('/waitlist', { email }, options);
}
