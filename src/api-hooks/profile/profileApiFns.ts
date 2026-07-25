import { apiClient, authClient, notifyUnauthorized } from '@app/lib/apiClient';
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

  return fetchAndHandle('/profiles/me/resume', 'POST', formData);
}

/** Upload a profile image (JPEG/PNG/WebP, max 2MB). Field name must be 'profileImage'. */
export function uploadProfileImage(file: File): Promise<ProfileDataResponseDto> {
  const formData = new FormData();
  formData.append('profileImage', file);

  return fetchAndHandle('/profiles/me/profile-image', 'POST', formData);
}

/** Permanently delete the authenticated user's profile (irreversible). */
export function deleteProfile(): Promise<void> {
  return authClient.delete<void>('/profiles/me');
}

// ─── Internal helper ─────────────────────────────────────────────────────────

/**
 * Low-level fetch wrapper for multipart form uploads.
 * We bypass authClient here because fetch-ponyfill handles the Content-Type
 * boundary automatically — the authClient sets JSON headers which multipart
 * cannot use.
 */
async function fetchAndHandle<T>(path: string, method: string, body: FormData): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    method,
    headers,
    body,
  });

  if (res.ok) {
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  // These uploads always carry the bearer token, so a 401 means an expired
  // session — funnel through the same global sign-out handler as ApiClient.
  if (res.status === 401) notifyUnauthorized();

  let message = `HTTP ${res.status}`;
  try {
    const bodyJson = await res.json();
    message = bodyJson?.message ?? message;
  } catch {
    // use default message
  }
  throw Object.assign(new Error(message), { status: res.status });
}
