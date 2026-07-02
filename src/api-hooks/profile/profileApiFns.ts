import { authClient } from '@app/lib/apiClient';
import type {
  ProfileDataResponseDto,
  CreateProfilePayload,
  UpdateProfilePayload,
} from '@typings/profileApi';

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

/** Upload a PDF resume. Field name must be 'resume'. */
export function uploadResume(file: File): Promise<ProfileDataResponseDto> {
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

  let message = `HTTP ${res.status}`;
  try {
    const bodyJson = await res.json();
    message = bodyJson?.message ?? message;
  } catch {
    // use default message
  }
  throw Object.assign(new Error(message), { status: res.status });
}
