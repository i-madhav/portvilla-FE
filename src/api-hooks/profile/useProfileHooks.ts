import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@app/providers/toast';
import { isCanceled } from '@app/lib/api';
import { useAppDispatch } from '@stores/store';
import {
  setProfileData,
  clearProfile,
  setProfileLoading,
  setProfileError,
  setMutating,
  setMutationError,
  resetProfileState,
} from '@stores/profileSlice';
import type {
  ProfileDataResponseDto,
  CreateProfilePayload,
  UpdateProfilePayload,
  UsernameAvailabilityDto,
  ResumeUploadResponseDto,
} from '@typings/profileApi';
import { validateUsername } from '@typings/profileApi';
import {
  createProfile as createProfileApi,
  getOwnProfile,
  updateProfile as updateProfileApi,
  uploadResume as uploadResumeApi,
  uploadProfileImage as uploadProfileImageApi,
  deleteProfile as deleteProfileApi,
  checkUsernameAvailability,
} from './profileApiFns';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const profileKeys = {
  all: ['profile'] as const,
  own: () => ['profile', 'own'] as const,
  usernameAvailability: (u: string) => ['profile', 'username-available', u] as const,
} as const;

// ─── Username availability ───────────────────────────────────────────────────

export type UsernameStatus =
  | { state: 'idle' }
  | { state: 'invalid'; message: string }
  | { state: 'checking' }
  | { state: 'available' }
  | { state: 'unavailable'; message: string }
  | { state: 'unknown' }; // server unreachable — never claim either way

/**
 * Debounced, server-backed availability check.
 *
 * The old Account step rendered "✓ Username is available" from *format*
 * validation alone — it never asked the server, so it cheerfully told users a
 * taken name was free and let them discover otherwise at submit, several steps
 * later.
 */
export function useUsernameAvailability(username: string, debounceMs = 400): UsernameStatus {
  const [debounced, setDebounced] = useState(username);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(username), debounceMs);
    return () => clearTimeout(t);
  }, [username, debounceMs]);

  const local = validateUsername(debounced);
  const shouldQuery = debounced.length >= 3 && local.valid;

  const query = useQuery<UsernameAvailabilityDto, Error>({
    queryKey: profileKeys.usernameAvailability(debounced),
    queryFn: () => checkUsernameAvailability(debounced),
    enabled: shouldQuery,
    staleTime: 60_000,
    retry: false,
  });

  if (username.length === 0) return { state: 'idle' };
  // While the debounce settles, keep showing "checking" rather than a verdict
  // computed from a stale value.
  if (username !== debounced) return { state: 'checking' };
  if (!local.valid) return { state: 'invalid', message: local.reason ?? 'Invalid username.' };
  if (query.isFetching) return { state: 'checking' };
  if (query.isError) return { state: 'unknown' };
  if (!query.data) return { state: 'idle' };

  if (query.data.available) return { state: 'available' };

  const message =
    query.data.reason === 'reserved'
      ? 'That name is reserved. Pick another.'
      : query.data.reason === 'invalid'
        ? 'That username is not valid.'
        : 'That username is taken.';
  return { state: 'unavailable', message };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Handles the common pattern of dispatching to Redux and showing toasts.
 * We return a wrapper that the hook builders call so every mutation is consistent.
 */
function useMutationCallbacks() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const onMutateStart = useCallback(() => {
    dispatch(setMutating(true));
    dispatch(setMutationError(null));
  }, [dispatch]);

  const onMutationSuccess = useCallback(
    (data: ProfileDataResponseDto, successMessage?: string) => {
      dispatch(setProfileData(data));
      dispatch(setMutating(false));
      if (successMessage) {
        showToast({ type: 'success', title: successMessage, message: '' });
      }
    },
    [dispatch, showToast],
  );

  const onMutationError = useCallback(
    (error: Error, title: string) => {
      dispatch(setMutating(false));
      // A canceled request means the caller moved on — the component unmounted
      // or a newer request superseded this one. Nothing failed, so there is
      // nothing to tell the user about.
      if (isCanceled(error)) return;
      dispatch(setMutationError(error.message));
      showToast({
        type: 'error',
        title,
        message: error.message,
      });
    },
    [dispatch, showToast],
  );

  return { onMutateStart, onMutationSuccess, onMutationError };
}

// ─── Profile bootstrap query ─────────────────────────────────────────────────

/**
 * Bootstrapping query: call this at app load to determine if the user has a
 * profile (200 → onboarding completed) or not (404 → needs onboarding).
 *
 * `enabled` should be tied to whether the user is authenticated.
 */
export function useOwnProfileQuery(enabled: boolean = true) {
  const dispatch = useAppDispatch();

  return useQuery<ProfileDataResponseDto, Error>({
    queryKey: profileKeys.own(),
    queryFn: async () => {
      dispatch(setProfileLoading());
      try {
        const data = await getOwnProfile();
        dispatch(setProfileData(data));
        return data;
      } catch (err) {
        const error = err as { status?: number; message?: string };
        if (error.status === 404) {
          // 404 means no profile yet — that's normal for new users
          dispatch(clearProfile());
          throw err; // let react-query know it failed
        }
        dispatch(setProfileError(error.message ?? 'Failed to load profile'));
        throw err;
      }
    },
    enabled,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      // Don't retry 404 (no profile yet) or 401 (expired session — the global
      // handler redirects to login); retrying either just adds noise.
      const apiError = error as { status?: number };
      if (apiError.status === 404 || apiError.status === 401) return false;
      return failureCount < 2;
    },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create the user's profile (one-shot, entry-point for onboarding). */
export function useCreateProfile() {
  const { onMutateStart, onMutationSuccess, onMutationError } = useMutationCallbacks();
  const queryClient = useQueryClient();

  return useMutation<ProfileDataResponseDto, Error, CreateProfilePayload>({
    mutationFn: (payload) => createProfileApi(payload),
    onMutate: onMutateStart,
    onSuccess: (data) => {
      onMutationSuccess(data);
      queryClient.invalidateQueries({ queryKey: profileKeys.own() });
    },
    onError: (error) => {
      onMutationError(error, 'Profile creation failed');
    },
  });
}

/** Update the authenticated user's profile (partial update). */
export function useUpdateProfile() {
  const { onMutateStart, onMutationSuccess, onMutationError } = useMutationCallbacks();
  const queryClient = useQueryClient();

  return useMutation<ProfileDataResponseDto, Error, UpdateProfilePayload>({
    mutationFn: (payload) => updateProfileApi(payload),
    onMutate: onMutateStart,
    onSuccess: (data) => {
      onMutationSuccess(data, 'Profile updated');
      queryClient.invalidateQueries({ queryKey: profileKeys.own() });
    },
    onError: (error) => {
      onMutationError(error, 'Profile update failed');
    },
  });
}

/**
 * Upload a PDF resume.
 *
 * Resolves with `{ profile, suggestions }`. Only `profile` is written to the
 * store — `suggestions` are drafts the caller shows for review, so persisting
 * them here would be the silent write the whole design avoids.
 */
export function useUploadResume() {
  const { onMutateStart, onMutationSuccess, onMutationError } = useMutationCallbacks();
  const queryClient = useQueryClient();

  return useMutation<ResumeUploadResponseDto, Error, File>({
    mutationFn: (file) => uploadResumeApi(file),
    onMutate: onMutateStart,
    onSuccess: (data) => {
      onMutationSuccess(data.profile, 'Resume uploaded');
      queryClient.invalidateQueries({ queryKey: profileKeys.own() });
    },
    onError: (error) => {
      onMutationError(error, 'Resume upload failed');
    },
  });
}

/** Upload a profile image (JPEG/PNG/WebP, max 2MB). */
export function useUploadProfileImage() {
  const { onMutateStart, onMutationSuccess, onMutationError } = useMutationCallbacks();
  const queryClient = useQueryClient();

  return useMutation<ProfileDataResponseDto, Error, File>({
    mutationFn: (file) => uploadProfileImageApi(file),
    onMutate: onMutateStart,
    onSuccess: (data) => {
      onMutationSuccess(data, 'Profile image updated');
      queryClient.invalidateQueries({ queryKey: profileKeys.own() });
    },
    onError: (error) => {
      onMutationError(error, 'Image upload failed');
    },
  });
}

/** Delete the authenticated user's profile (irreversible). */
export function useDeleteProfile() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteProfileApi(),
    onSuccess: () => {
      dispatch(resetProfileState());
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      showToast({
        type: 'success',
        title: 'Profile deleted',
        message: 'Your profile has been permanently removed.',
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Profile deletion failed',
        message: error.message,
      });
    },
  });
}
