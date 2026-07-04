# Onboarding Revamp + Profile / Agent Dashboard

## Status
Accepted

## Context
The profile document (BE `profile.schema.ts`) is a rich, AI-agent-powering
professional presence: an `identity` section plus ten content sections (`works`,
`timeline`, `capabilities`, `offerings`, `metrics`, `testimonials`, `team`,
`media`, `content`, `social`), an `aiSettings` section (LLM provider/model/key),
and an `agentPersona` section (voice-agent tone, verbosity, technical depth,
speaking speed, name). Per the BE decision docs, this data exists to power a
LiveKit voice agent that represents the user to visitors.

The frontend only collected `username` + four identity fields during onboarding,
and `/` was the 3D landing scene — there was no surface to see or manage the
profile or the agent. We are revamping onboarding to collect the essentials and
adding a real dashboard.

Constraints from the BE docs (respected here):
- `agentPersona` is **settings-page functionality, not onboarding**
  (`2026-06-03-agent-persona-section.md`).
- `POST /profiles` requires only `username` + `identity`; every other section is
  optional (`2026-06-02-profile-data-storage.md`). Onboarding collects
  essentials; the rest is edited on the dashboard via `PATCH /profiles/me`.
- Response DTO exposes `aiSettings.apiKeyConfigured` (boolean), never the raw key.

## Decision

### 1. Routing
- Add `ROUTES.DASHBOARD = '/dashboard'`, a **protected** route rendering the new
  `DashboardPage`.
- `/` keeps the public landing scene. After login/onboarding, authenticated
  users land on `/dashboard`.
- `OnboardingPage`: when a profile already exists (or right after creating one),
  redirect to `/dashboard` (previously pointed at the non-existent
  `ROUTES.DASHBOARD` → fixed here properly).

### 2. Onboarding — essentials, multi-step
Data-driven stepper accumulating one `OnboardingData` object, then a single
`POST /profiles` at the end. Steps:
1. **Welcome** (intro)
2. **Account** — username (live-validated) + visibility (+ protected password)
3. **Identity** *(required)* — entityType, name, tagline, bio, about, location,
   industry, availability
4. **Expertise** *(skippable)* — `capabilities[]` (name + proficiency + category)
5. **Experience** *(skippable)* — `timeline[]` (category, label, organization,
   date range, description)
6. **Projects** *(skippable)* — `works[]` (type, name, tagline, description, url,
   technologies)
7. **Contact** *(skippable, final)* — `social` (links[], email, phone,
   calendarUrl); "Create profile" submits.

Non-identity steps have a "Skip for now" affordance. Array steps use a shared
`RepeatableList` primitive (add/remove cards) built on the existing
`onboarding/styles.ts` design system.

### 3. Dashboard — view + inline section editing
`DashboardPage` fetches `GET /profiles/me` (existing `useOwnProfileQuery`). No
profile → redirect to `/onboarding`. Renders:
- **Identity header** (name, tagline, avatar, location, industry, availability).
- **Editable section cards**: Identity, Capabilities, Timeline, Works, Social.
- **Agent Config** panel: `aiSettings` (provider, model, baseUrl, API key —
  write-only, shows "configured" state) + `agentPersona` (agentName, tone,
  verbosity, technicalDepth, speakingSpeed).
- **Read-only display** of the remaining sections when non-empty (`offerings`,
  `metrics`, `testimonials`, `team`, `media`, `content`) with an "add on…"
  follow-up note.

Each editable card toggles view ↔ edit and persists via `PATCH /profiles/me`
(existing `useUpdateProfile`), which invalidates the profile query.

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Essentials onboarding + dashboard editing (chosen) | Completable flow; agent gets real context; dashboard owns depth | Two surfaces to build |
| Collect all 11 sections in onboarding | One place | Long flow users abandon; contradicts "optional" schema intent |
| Replace `/` with dashboard | One landing | Loses the marketing scene; extra redirect logic |

## Consequences
- New: `pages/dashboard/*`, `routes/dashboard.routes.tsx`, onboarding step
  components + shared primitives. Modified: `routes/index.ts`, `OnboardingPage`,
  auth redirects.
- `agentPersona` / `aiSettings` are configured only from the dashboard, matching
  the BE intent.
- **Follow-up:** inline editing for offerings / metrics / testimonials / team /
  media / content (currently read-only display); resume + image uploads on the
  dashboard; public read-only dashboard at `/:username`.
