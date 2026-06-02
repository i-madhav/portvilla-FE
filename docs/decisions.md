# PortVilla Frontend — Decision Log

Living ADR-style trace of implementation choices. Update at the end of each phase or whenever a non-obvious decision is made. Mark superseded entries rather than deleting them.

---

## DEC-001: Keep fetch-based API client instead of migrating to axios

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** `axios` is listed in `package.json` but unused. The BE frontend guide recommends axios; the existing codebase uses a custom `fetch` wrapper with JWT refresh retry logic.

**Decision:** Extend the existing `ApiClient` / `AuthenticatedApiClient` in `src/lib/api-client.ts` with `uploadFormData` rather than introducing axios.

**Rationale:** The fetch client already handles 401 refresh correctly. Adding multipart upload to it is a small, focused change. Avoids dual HTTP stacks and keeps the diff minimal.

**Implementation:** `src/lib/api-client.ts` — new `uploadFormData` method on `AuthenticatedApiClient`.

**Alternatives considered:** Migrate to axios with interceptors (rejected: larger refactor, duplicate patterns during transition).

---

## DEC-002: Mirror BE DTOs in `src/types/profile.ts` as single source of truth

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** The frontend `Profile` interface in `profileStore.ts` used `_id`, omitted `aiSettings`, and diverged from the NestJS `ProfileDataResponseDto`.

**Decision:** Create `src/types/profile.ts` with enums, section interfaces, `ProfileData`, `CreateProfilePayload`, and `UpdateProfilePayload` matching the backend exactly.

**Rationale:** Type drift caused silent runtime bugs (e.g. missing `username` on create). A single types file aligned to BE Swagger/DTOs prevents contract mismatches.

**Implementation:** `src/types/profile.ts`; all services and stores import from here. Removed inline `Profile` from `profileStore.ts`.

**Alternatives considered:** Generate types from OpenAPI (deferred: no codegen setup yet).

---

## DEC-005: `docs/decisions.md` as project-level trace log

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Multiple architectural choices across phases (API client, onboarding state, dashboard gap) need traceability without relying on chat history or git blame alone.

**Decision:** Maintain this file at `docs/decisions.md` using a consistent DEC-NNN format (context, decision, rationale, implementation, alternatives).

**Rationale:** Mirrors the BE repo's `docs/decisions/` pattern. Gives future contributors a readable audit trail.

**Implementation:** `docs/decisions.md`; updated at the end of each implementation todo.

**Alternatives considered:** Inline code comments only (rejected: scattered, hard to discover).

---

## DEC-003: Zustand onboarding store instead of sessionStorage JSON blobs

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Onboarding previously stored step data in `sessionStorage` as untyped JSON strings, assembled only at final submit. This caused missing fields (no `username`), no validation between steps, and fragile parsing.

**Decision:** Use `src/stores/onboardingStore.ts` to accumulate validated step data from react-hook-form + Zod schemas. Each step writes to the store on successful validation.

**Rationale:** Typed, in-memory state survives navigation between steps without serialization bugs. Enables 409 username conflict redirect back to step 1 with preserved data.

**Implementation:** `src/stores/onboardingStore.ts`, `src/schemas/profile.schemas.ts`, updated step components, new `ReviewVisibility.tsx`.

**Alternatives considered:** React Context (rejected: Zustand already used for profile state); keep sessionStorage (rejected: untyped, error-prone).

---

## DEC-006: Zod + react-hook-form for onboarding validation

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Backend uses class-validator with strict rules (username regex, URL formats, protected password length). Frontend had no client-side validation.

**Decision:** Mirror BE validation rules in `src/schemas/profile.schemas.ts` and wire each onboarding step with `useForm` + `zodResolver`.

**Rationale:** Catches errors before API calls; matches BE contract; dependencies already in package.json.

**Implementation:** All five onboarding step components; conditional validation for protected visibility and ollama/custom baseUrl.

**Alternatives considered:** Manual validation in submit handlers (rejected: duplicated logic, harder to maintain).

---

## DEC-007: 409 username conflict redirects to step 1 with inline error

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Backend returns 409 when username is taken or reserved.

**Decision:** On 409 during profile create, set `usernameConflictError` in onboarding store and navigate back to Basic Info with the error banner visible.

**Rationale:** User must change username at the source step; other collected data remains in the store.

**Implementation:** `ReviewVisibility.tsx` catch block; `BasicInfo.tsx` displays `usernameConflictError`.

---

## DEC-004: Graceful degradation for missing `/dashboard/:username` endpoint

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** The frontend public portfolio page calls `GET /dashboard/:username`, but the backend dashboard module is not implemented yet (commit `3906233f`).

**Decision:** Keep a typed `DashboardService` stub pointing at the future endpoint. Show a clear "Portfolio not available" message on 404/403/network errors instead of a broken page or fake data. Defer password verification UI until BE ships `POST /dashboard/:username/verify`.

**Rationale:** Avoids misleading users with empty/broken portfolios; makes integration a one-line service swap when BE lands.

**Implementation:** `src/services/profile.service.ts` (`DashboardService`), `src/stores/profileStore.ts` (`publicProfile`, `notFound`), `src/routes/portfolio/[username]/PortfolioView.tsx`.

**Alternatives considered:** Mock portfolio data (rejected: violates plan, misleading); hide `/:username` route entirely (rejected: URL structure should remain for future use).

---

## DEC-008: Section-based PATCH saves on Edit Profile

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Backend accepts partial `UpdateProfileDto` with any combination of sections via single `PATCH /profiles/me`.

**Decision:** Split Edit Profile into independent sections (basic, professional, external, AI, visibility), each saving only its slice of the payload.

**Rationale:** Matches BE design; avoids large form submit failures; clearer UX for partial updates.

**Implementation:** `src/routes/candidate/EditProfile.tsx` with per-section save buttons and brief "Saved" feedback.

**Alternatives considered:** Single monolithic save (rejected: poor UX for large profiles).

---

## DEC-009: Client-side file size/type checks before upload

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** BE enforces PDF-only resume (5 MB) and JPEG/PNG/WebP images (2 MB) via multer config.

**Decision:** Mirror limits in `ResumeUpload.tsx` and `ProfileImageUpload.tsx` before calling the API.

**Rationale:** Faster feedback; reduces unnecessary network requests.

**Implementation:** `src/components/profile/ResumeUpload.tsx`, `ProfileImageUpload.tsx`.

**Alternatives considered:** Server-only validation (rejected: worse UX).

---

## DEC-010: Remove unused axios dependency

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** `axios` was in `package.json` but never imported; fetch-based client is the standard.

**Decision:** Remove `axios` from dependencies.

**Rationale:** Reduces bundle/install size; avoids confusion about which HTTP client to use.

**Implementation:** `package.json`.

**Alternatives considered:** Migrate to axios (rejected in DEC-001).

---

## DEC-011: ErrorBanner component for API error display

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Error messages were duplicated inline across forms with inconsistent styling; some components used axios-style `err.response?.data?.message`.

**Decision:** Add `src/components/ui/ErrorBanner.tsx` and `getApiErrorMessage()` in `src/lib/errors.ts` for consistent error extraction and display.

**Rationale:** Single pattern for `ApiError` handling; dismissible banners improve UX on settings/edit pages.

**Implementation:** `ErrorBanner.tsx`, `errors.ts`, used in settings, edit profile, portfolio view, onboarding.

**Alternatives considered:** Toast library (deferred: no dependency added for MVP).

---

## DEC-012: Safe token refresh bootstrap (fix post-login redirect loop)

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** After login, users were redirected back to `/login`. Root cause: `AuthContext` called `authService.refresh()` on mount; if that in-flight request failed (stale token, React Strict Mode double-mount, or race with a fresh login), it cleared **all** tokens including ones just set by login. `ProtectedRoute` also evaluated auth before bootstrap finished.

**Decision:** Extract `refreshTokens()` in `src/lib/token-refresh.ts` with (1) deduplicated concurrent refresh calls, (2) clear storage only when the failed refresh token still matches localStorage, (3) `isInitializing` flag on AuthContext, (4) ProtectedRoute shows loader until bootstrap completes.

**Rationale:** Backend rotates refresh tokens on every refresh; a stale in-flight refresh must not wipe a successful login. Matches BE `auth.service.ts` refresh rotation behavior.

**Implementation:** `token-refresh.ts`, `AuthContext.tsx`, `ProtectedRoute.tsx`, `api-client.ts`. Login now redirects to `/settings`.

**Alternatives considered:** Disable Strict Mode (rejected); always skip mount refresh (rejected: breaks session restore).

---

## DEC-013: Treat `GET /profiles/me` 404 as “no portfolio yet”

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** After login, the dashboard calls `GET /api/v1/profiles/me`. The backend returns **404** when the auth user exists but has not created a portfolio profile (`POST /profiles`). Account data lives at `GET /api/v1/users/me` (email, role, isEmailVerified).

**Decision:** Keep treating 404 in `profileStore.fetchMyProfile()` as `notFound` (not an error). After login/OTP login, call `resolvePostAuthPath()` — redirect to `/onboarding` when 404, otherwise `/settings`. Show a clear empty state on settings when `notFound`.

**Rationale:** 404 is expected for new accounts; routing them to onboarding avoids confusion in the Network tab and matches product flow.

**Implementation:** `post-auth-redirect.ts`, `Login.tsx`, `LoginOtpVerifyPage.tsx`, `CandidateSettings.tsx`.

**Alternatives considered:** Change backend to return 200 with null body (rejected: BE contract is 404).

---

## DEC-014: Professional form start dates aligned with backend DTOs

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Backend `ProfessionalInfoDto` requires `startDate` on `currentPosition`, `education[]`, and `experience[]` (format `YYYY-MM`). Frontend onboarding only collected title/company and hardcoded `startDate: ''` in the create payload.

**Decision:** Expand step 2 schema and UI with month inputs (`type="month"`) for current role, education, and experience. Mirror the same fields on Edit Profile professional section.

**Rationale:** Matches BE validation; prevents silent empty dates in stored profiles.

**Implementation:** `profile.schemas.ts`, `ProfessionalInfo.tsx`, `onboardingStore.ts`, `EditProfile.tsx`, `ReviewVisibility.tsx`.

---

## DEC-015: Redirect away from onboarding when profile already exists

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Users with an existing portfolio (confirmed via `GET /profiles/me` in Swagger) were still sent to the onboarding/create-profile flow after login. Causes included stale Zustand profile state across sessions and no guard on `/onboarding`.

**Decision:** Reset and hydrate profile store in `resolvePostAuthPath()` after login. Add `OnboardingProfileGuard` to redirect existing profiles to `/settings`. Skip redundant dashboard refetch when profile is already loaded. On create conflict (409), fetch profile and redirect to dashboard if it exists. Clear profile store on logout.

**Rationale:** Profile existence must be determined from a fresh authenticated API call, not cached onboarding state.

**Implementation:** `profileStore.ts`, `post-auth-redirect.ts`, `OnboardingProfileGuard.tsx`, `App.tsx`, `CandidateSettings.tsx`, `ReviewVisibility.tsx`.

---

## DEC-016: Split account vs portfolio API routes

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Backend extracted account data from the profile module. `GET /profile/me` (singular) was removed; account data is now `GET /users/me`. Portfolio data remains `GET /profiles/me`.

**Decision:** Add `userService.getMe()` → `GET /users/me` with `UserAccount` type. Load account in `AuthContext` via API instead of JWT decode alone (JWT lacks `isEmailVerified`). Keep `profileService` on `/profiles/me` for portfolio CRUD.

**Rationale:** Matches BE domain split; account and portfolio are separate resources with separate endpoints.

**Implementation:** `src/types/user.ts`, `src/services/user.service.ts`, `AuthContext.tsx`, `profile.service.ts` comment.

---

## DEC-017: Single decision log at `docs/decisions.md`

**Date:** 2026-06-03  
**Status:** Accepted  

**Context:** Decision entries existed in both `decisions.md` (repo root) and `docs/decisions.md`, with the root copy ahead (DEC-012–016 missing from docs).

**Decision:** Consolidate all entries into `docs/decisions.md` only; remove the root file. Update DEC-005 to reference the docs path.

**Rationale:** One canonical location, aligned with BE repo layout; avoids drift between duplicate files.

**Implementation:** Merged content into `docs/decisions.md`; deleted root `decisions.md`.

**Alternatives considered:** Keep root copy as symlink (rejected: unnecessary on all platforms).
