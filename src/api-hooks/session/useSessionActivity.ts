import { useQuery } from '@tanstack/react-query';
import { authClient } from '@app/lib/apiClient';
import type { SessionActivityDto } from '@typings/profileApi';

/**
 * The owner's agent-conversation activity. Counts only real conversations
 * (ACTIVE/ENDED) — the backend excludes PENDING mints, so this never inflates.
 *
 * Kept non-blocking on the dashboard: a failure here must not take down the
 * page, so the caller treats absence as "no data yet" rather than an error.
 */
export function useSessionActivity(enabled: boolean) {
  return useQuery<SessionActivityDto, Error>({
    queryKey: ['session', 'activity'],
    queryFn: () => authClient.get<SessionActivityDto>('/session/activity'),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
