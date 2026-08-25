import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@app/lib/api';
import { getPublicProfile, unlockPublicProfile } from '@api-hooks/profile/profileApiFns';
import type { PublicProfileDto } from '@typings/profileApi';

export type PublicProfileState =
  | { status: 'loading' }
  | { status: 'ready'; profile: PublicProfileDto }
  | { status: 'protected'; unlocking: boolean; error: string | null }
  | { status: 'not-found' }
  | { status: 'error' };

/**
 * Loads a public profile and models the visibility outcomes the backend
 * distinguishes: 404 (private or missing — indistinguishable by design), and
 * 401 (password gate). Anything else is a generic error rather than a blank page.
 */
export function usePublicProfile(username: string | undefined) {
  const [state, setState] = useState<PublicProfileState>({ status: 'loading' });

  const load = useCallback(async (name: string) => {
    setState({ status: 'loading' });
    try {
      const profile = await getPublicProfile(name);
      setState({ status: 'ready', profile });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setState({ status: 'protected', unlocking: false, error: null });
      } else if (err instanceof ApiError && err.status === 404) {
        setState({ status: 'not-found' });
      } else {
        setState({ status: 'error' });
      }
    }
  }, []);

  useEffect(() => {
    if (!username) {
      setState({ status: 'not-found' });
      return;
    }
    void load(username);
  }, [username, load]);

  const unlock = useCallback(
    async (password: string) => {
      if (!username) return;
      setState({ status: 'protected', unlocking: true, error: null });
      try {
        const profile = await unlockPublicProfile(username, password);
        setState({ status: 'ready', profile });
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 401
            ? 'That password is not right.'
            : 'Something went wrong. Try again.';
        setState({ status: 'protected', unlocking: false, error: message });
      }
    },
    [username],
  );

  return { state, unlock };
}
