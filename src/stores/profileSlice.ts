import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProfileDataResponseDto } from '@typings/profileApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileState {
  /** The full profile data, null until fetched. */
  data: ProfileDataResponseDto | null;
  /** Whether a profile exists for the current user (determines onboarding vs dashboard). */
  exists: boolean;
  /** Loading / error state for the initial bootstrap fetch. */
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  /** Tracks whether a profile is being written (create / update / delete). */
  mutating: boolean;
  mutationError: string | null;
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: ProfileState = {
  data: null,
  exists: false,
  status: 'idle',
  error: null,
  mutating: false,
  mutationError: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /** Full replacement of the profile data in store. */
    setProfileData(state, action: PayloadAction<ProfileDataResponseDto>) {
      state.data = action.payload;
      state.exists = true;
      state.status = 'succeeded';
      state.error = null;
    },

    /** Mark profile as non-existent (e.g. 404 on initial fetch). */
    clearProfile(state) {
      state.data = null;
      state.exists = false;
      state.status = 'idle';
      state.error = null;
    },

    /** Bootstrap loading state. */
    setProfileLoading(state) {
      state.status = 'loading';
      state.error = null;
    },

    /** Bootstrap error state. */
    setProfileError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },

    /** Mutation-level loading. */
    setMutating(state, action: PayloadAction<boolean>) {
      state.mutating = action.payload;
    },

    /** Mutation-level error. */
    setMutationError(state, action: PayloadAction<string | null>) {
      state.mutationError = action.payload;
    },

    /** Reset the entire slice (e.g. on logout). */
    resetProfileState() {
      return { ...initialState, status: 'idle' as const };
    },
  },
});

export const {
  setProfileData,
  clearProfile,
  setProfileLoading,
  setProfileError,
  setMutating,
  setMutationError,
  resetProfileState,
} = profileSlice.actions;

export default profileSlice.reducer;
