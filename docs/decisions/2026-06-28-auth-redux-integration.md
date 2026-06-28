# Auth Redux Integration

## Status
Accepted

## Context
The BE exposes 8 auth endpoints (register, verify-email, resend-otp, login, login/otp/request, login/otp, refresh, logout). The LE has no auth layer, no Redux, and no routing — only two raw `fetch` helpers in `lib/`. `src/routes/` and `src/stores/` are empty. We need to wire up all auth flows with proper state management.

## Decision
- Install **Redux Toolkit** + **react-redux** + **react-router-dom**.
- Create `src/lib/apiClient.ts` — a single `ApiClient` class that handles base URL, `Content-Type`, Bearer token injection, and JSON error extraction; all API modules instantiate from it.
- Create `src/stores/authSlice.ts` — RTK slice owning `{ accessToken, refreshToken, status, error }` with async thunks for every auth endpoint. Tokens persisted in `localStorage`.
- Create one route component per flow in `src/routes/auth/`:
  - `RegisterPage.tsx`, `VerifyEmailPage.tsx`, `LoginPage.tsx` (tabs: password / OTP), `RequestOtpPage.tsx`
- Wire `<Provider>` and `<RouterProvider>` in `main.tsx`.
- Palette: `#9CB080` (sage), `#618764` (forest), `#2B5748` (deep), `#273338` (base/bg).

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Raw fetch in each component | Zero deps | No shared state, token management scattered |
| React Context for auth state | Lighter than Redux | No devtools, awkward async, doesn't scale |
| **Redux Toolkit (chosen)** | Devtools, serialisable state, thunk middleware built-in | Extra packages |

## Consequences
- `main.tsx` grows to include `<Provider>` and router setup.
- `sessionApi.ts` / `waitlistApi.ts` can optionally be migrated to use `ApiClient` in a follow-up.
- Token refresh on 401 is a follow-up concern (axios interceptor pattern not needed yet with RTK thunks).
