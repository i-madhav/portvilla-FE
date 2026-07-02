import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useToast } from '@app/providers/ToastContext';
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
} from '@typings/profileApi';
import {
  createProfile as createProfileApi,
  getOwnProfile,
  updateProfile as updateProfileApi,
  uploadResume as uploadResumeApi,
  uploadProfileImage as uploadProfileImageApi,
  deleteProfile as deleteProfileApi,
} from './profileApiFns';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const profileKeys = {
  all: ['profile'] as const,
  own: () => ['profile', 'own'] as const,
} as const;

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
  const { showToast } = useToast();

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
      // Don't retry 404 (no profile yet) — that's expected
      const apiError = error as { status?: number };
      if (apiError.status === 404) return false;
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

/** Upload a PDF resume. */
export function useUploadResume() {
  const { onMutateStart, onMutationSuccess, onMutationError } = useMutationCallbacks();
  const queryClient = useQueryClient();

  return useMutation<ProfileDataResponseDto, Error, File>({
    mutationFn: (file) => uploadResumeApi(file),
    onMutate: onMutateStart,
    onSuccess: (data) => {
      onMutationSuccess(data, 'Resume uploaded');
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
