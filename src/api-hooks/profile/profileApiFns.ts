import { apiClient, authClient, UPLOAD_TIMEOUT_MS } from '@app/lib/api';
import type {
  ProfileDataResponseDto,
  CreateProfilePayload,
  UpdateProfilePayload,
  UsernameAvailabilityDto,
  ResumeUploadResponseDto,
  PublicProfileDto,
} from '@typings/profileApi';

// ─── Public endpoints ────────────────────────────────────────────────────────

/**
 * Check whether a username can be claimed. Public — it must be callable before
 * a profile exists.
 */
export function checkUsernameAvailability(username: string): Promise<UsernameAvailabilityDto> {
  return apiClient.get<UsernameAvailabilityDto>(
    `/profiles/username-available?username=${encodeURIComponent(username)}`,
  );
}

/**
 * Fetch a public profile by username. Throws ApiError with status 404 (private
 * or missing) or 401 (password-protected — the caller shows a gate).
 */
export function getPublicProfile(username: string): Promise<PublicProfileDto> {
  return apiClient.get<PublicProfileDto>(`/profiles/public/${encodeURIComponent(username)}`);
}

/** Exchange a password for a protected profile. Throws ApiError 401 on a wrong password. */
export function unlockPublicProfile(username: string, password: string): Promise<PublicProfileDto> {
  return apiClient.post<PublicProfileDto>(
    `/profiles/public/${encodeURIComponent(username)}/unlock`,
    { password },
  );
}

// ─── Authenticated endpoints (JWT required) ──────────────────────────────────

/** Create the authenticated user's profile. One-shot — returns 409 on repeat. */
export function createProfile(payload: CreateProfilePayload): Promise<ProfileDataResponseDto> {
  return authClient.post<ProfileDataResponseDto>('/profiles', payload);
}

/** Fetch the authenticated user's complete profile data. */
export function getOwnProfile(): Promise<ProfileDataResponseDto> {
  return authClient.get<ProfileDataResponseDto>('/profiles/me');
}

/** Partially update the authenticated user's profile. */
export function updateProfile(payload: UpdateProfilePayload): Promise<ProfileDataResponseDto> {
  return authClient.patch<ProfileDataResponseDto>('/profiles/me', payload);
}

/**
 * Upload a PDF resume. Field name must be 'resume'.
 *
 * Returns the updated profile alongside any draft entries extracted from the
 * document. `suggestions` is null when extraction is unavailable or the PDF
 * carried no readable text.
 */
export function uploadResume(file: File): Promise<ResumeUploadResponseDto> {
  const formData = new FormData();
  formData.append('resume', file);

  return authClient.post<ResumeUploadResponseDto>('/profiles/me/resume', formData, {
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}

/** Upload a profile image (JPEG/PNG/WebP, max 2MB). Field name must be 'profileImage'. */
export function uploadProfileImage(file: File): Promise<ProfileDataResponseDto> {
  const formData = new FormData();
  formData.append('profileImage', file);

  return authClient.post<ProfileDataResponseDto>('/profiles/me/profile-image', formData, {
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}

/** Permanently delete the authenticated user's profile (irreversible). */
export function deleteProfile(): Promise<void> {
  return authClient.delete<void>('/profiles/me');
}
