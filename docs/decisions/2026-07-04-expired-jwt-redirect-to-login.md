# Redirect to Login on Expired / Rejected JWT

## Status
Accepted

## Context
When the access token expired, the server correctly returned `401` for
authenticated requests (e.g. `GET /api/v1/profiles/me`), but the frontend never
redirected the user to the login page. Instead it kept firing the same request
in a loop (visible as repeated `401` lines in the backend log).

Three root causes:
1. **`ProtectedRoute`** only checked whether an access token *existed* in Redux
   (hydrated from `localStorage`), not whether it was still valid. An expired
   token therefore passed the guard and let the user into a protected page.
2. **`apiClient`** had no global handling for `401`: an authenticated request
   that failed just threw `ApiError`, so tokens were never cleared and nothing
   navigated away.
3. **`useOwnProfileQuery`** retried on `401` (and refetched), producing the
   request storm.

## Decision
Handle expired sessions in three coordinated places:

1. **Client-side expiry check** — new `src/lib/jwt.ts#isTokenExpired` decodes the
   (unverified) JWT payload and checks the `exp` claim. `ProtectedRoute` now
   treats a missing *or expired* token as unauthenticated, redirects to
   `/login`, and clears the stale token from state. The server stays the source
   of truth; this is only a cheap "is it worth sending?" gate.

2. **Global 401 handler** — `apiClient` gains `setUnauthorizedHandler` /
   `notifyUnauthorized`. On a `401` from an *authenticated* request, it invokes
   the handler (wired in `main.tsx`) which clears the session
   (`clearTokensAndState`), clears the react-query cache, and navigates to
   `/login` (guarded against a redirect loop when already there). This is the
   safety net for tokens that expire mid-session. Unauthenticated `401`s (e.g. a
   failed login) deliberately do **not** trigger it.

3. **No retry on 401** — `useOwnProfileQuery` no longer retries `401`, stopping
   the loop.

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Global 401 handler + client expiry check (chosen) | Fixes both the storm and the "stale token passes guard" bug; centralized | Two touch-points to keep in sync |
| Only decode expiry in `ProtectedRoute` | Simple | Misses tokens that expire *after* the page mounts (no safety net) |
| Silent token refresh on 401, redirect only if refresh fails | Best UX (no re-login while refresh token valid) | Larger change (request queuing/retry); the ask was explicitly "redirect to login" — deferred as follow-up |

## Consequences
- Expired sessions now deterministically land on `/login`; no more 401 loops.
- New file `src/lib/jwt.ts`. Modified: `apiClient.ts`, `ProtectedRoute.tsx`,
  `main.tsx`, `profileApiFns.ts` (multipart uploads funnel through
  `notifyUnauthorized`), `useProfileHooks.ts`.
- Signature verification stays server-side; the client only reads `exp`.
- **Follow-up:** silent refresh-token flow on 401 (try `/auth/refresh` once
  before redirecting) for a smoother UX while the refresh token is still valid.
