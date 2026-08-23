# Warm voice-first design system

- Status: accepted
- Date: 2026-08-23
- Scope: `portvilla-LE/portvilla-LE`

## Context

The frontend had three unrelated visual systems: a black 3D landing sequence, green account screens with page-local colors, and a separate dark theme for onboarding and the dashboard. Repeated controls were style objects or hard-coded elements, so the same action changed shape and contrast between routes. An initial redesign also replaced the 3D sequence with a conventional light landing page; product direction subsequently restored the original immersive experience.

Portvilla is a voice-first presence layer. Its interface needs to make the agent central, distinguish human content from system state, and render many entity types without multiplying page templates.

## Decision

Adopt one light, warm visual system across account, onboarding, dashboard, and public-profile routes. The root landing route is an intentional exception: it retains the existing camera-driven 3D loader, scenery, and tunnel sequence. `tailwind.config.ts` is the canonical source for product-interface tokens. `src/shared-components/theme/tokens.ts` mirrors those values for the remaining data-heavy components that still use React style objects.

New work uses the components in `src/shared-components/ui`. A page chooses a component variant; it does not recreate the component's visual treatment.

## Design thesis

1. The orb represents the agent only inside the 3D landing sequence. It is not decorative brand chrome and does not appear on login, signup, other account screens, public profiles, navigation, or the favicon.
2. The page is warm paper; cards are white. This surface relationship creates depth before shadows are added.
3. Human language uses Bricolage Grotesque. System language—keys, state, telemetry, counts, and section order—uses IBM Plex Mono.
4. Copy describes mechanism in short, direct statements. It avoids unsupported marketing claims.

User-supplied profile and cover images remain valid content. The “orb only” rule applies to product chrome and decorative imagery, not to data owned by a profile.

## Color palette

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F6F5F1` | Page ground only |
| `paper-raised` | `#FFFFFF` | Cards, fields, tiles, and glass chrome |
| `ink` | `#14131A` | Headings, primary actions, blocking states |
| `ink/70` | `rgba(20,19,26,.70)` | Strong secondary text |
| `ink/60` | `rgba(20,19,26,.60)` | Body text |
| `ink/45` | `rgba(20,19,26,.45)` | Meta text and tertiary labels |
| `ink/12` | `rgba(20,19,26,.12)` | Interactive-control borders |
| `ink/8` | `rgba(20,19,26,.08)` | Hairlines and card borders |
| `violet` | `#6D28D9` | Agent state, active state, section eyebrows, waveform |
| `violet-deep` | `#5B21B6` | Links and schema keys on white |
| `violet-soft` | `#A78BFA` | 3D landing orb glow and edge ring |
| `citron` | `#D8F35A` | Selection and large supporting washes; never text |
| `citron-pale` | `#EDFBB4` | 3D landing orb core highlight and supporting washes |
| `teal` | `#0891B2` | Data graphics |
| `moss` | `#4D7C0F` | Data graphics |

No separate traffic-light palette is introduced. Violet expresses active, complete, or connected states. Ink expresses blocking/error states, with the text label carrying the exact meaning. This prevents incidental red/green accents from breaking the two-accent viewport rule.

## Typography

- Sans: Bricolage Grotesque, weights 300, 400, 600, 700, and 800.
- Mono: IBM Plex Mono, weights 400, 500, and 600.
- Display scale: `h1` is `clamp(46px, 7.4vw, 104px)`; `h2` is `clamp(34px, 4.4vw, 58px)`; `h3` is 20px.
- Reading scale: lead 18.5px, body 15px, micro 13px, meta 11.5px.
- Large type has progressively tighter tracking. Mono meta is uppercase with positive `0.12em` tracking.
- Headlines use balanced wrapping and paragraphs use pretty wrapping. Body copy caps at 700px; section intros cap at 720px.
- The restored 3D landing keeps its established cinematic typography and copy; the product typography scale applies after entry into account and application routes.

## Layout and surfaces

- Content width: 1180px.
- Page gutter: 34px when space permits, 20px on narrow screens.
- Major section rhythm: 110px vertical padding with one `ink/8` top hairline.
- Multi-item content uses auto-fit grids, normally from 14px to 20px gaps. It does not hard-code breakpoint column counts.
- Radius ladder: pill controls, 18px tiles and fields, 20px cards, 28px stage panels.
- Glass cards use translucent raised paper, 20px blur, an `ink/8` border, and a low neutral shadow.
- Card hover changes only the border to violet at 45% and lifts 4px. It does not scale, recolor, or change shadow.

Authenticated shells retain purpose-specific layouts: onboarding is one focused form column, because a static page preview misrepresents the voice product; the dashboard is a navigation rail plus an auto-fitting bento content area organized around tuning, grounding, sharing, and monitoring the agent. They consume the same surface, typography, control, and color tokens.

The root landing is full-viewport, camera-led, and intentionally does not use the paper, glass-card, or application-grid layout. Its fixed canvas is paired with a document-height scroll spacer so GSAP can scrub the tunnel journey.

## Orb and motion

The active orb is `OrbCore2D`, rendered inside the Three.js tunnel canvas. Its geometry, entrance timing, voice amplitude response, halo, and sonar behavior stay unchanged. Only its shader palette changes:

- disc centre: `violet` (`#6D28D9`);
- disc edge: `violet-deep` (`#5B21B6`);
- nebula, outer ring, and aura: `violet-soft` (`#A78BFA`);
- speaking core and sonar highlight: `citron-pale` (`#EDFBB4`).

No reusable CSS orb component is part of the product UI. If the agent needs representation on a future non-landing screen, that requires a separate interaction decision rather than reusing the landing orb as decoration.

## Component contract

The canonical UI module is `src/shared-components/ui`:

| Component | Responsibility | Variants or inputs |
| --- | --- | --- |
| `Button` | Native button behavior and visual treatment | `primary`, `secondary`, `ghost`; default or compact; full width |
| `ButtonLink` | Internal navigation with button treatment | Same variants and sizing as `Button` |
| `ButtonAnchor` | External navigation with button treatment | Same variants and sizing as `Button` |
| `InputField` | Label, field, hint, error relationship, IDs, and ARIA state | Native input props plus `label`, `hint`, `error` |
| `Surface` | Glass card or stage container | `card`, `stage` |
| `Badge` | Mono numbered eyebrow/state label | Content only |
| `FormNotice` | Consistent inline form status | Content only |
| `Brand` | Text wordmark and home navigation | One wordmark treatment; no orb mark |
| `AuthShell` | Shared account-route ground, brand, card, heading, and footer | Eyebrow, title, description, content, footer |

Feature components may compose these primitives but must not copy their class strings or colors. A new recurring visual value is added to the Tailwind configuration first, then consumed by name.

`src/shared-components/theme/primitives.ts` remains a compatibility bridge for the existing onboarding and dashboard editors. It must mirror the canonical tokens; it is not an independent palette.

## Interaction and accessibility

- All interactive controls retain visible `:focus-visible` rings.
- Controls keep at least a 44px default touch target; compact variants are reserved for dense secondary actions.
- Inputs stay at 16px to avoid viewport zoom on iOS.
- Loading, validation, and permission states are labeled in text and never depend on color alone.
- Decorative aurora and grids are hidden from assistive technology.
- The canvas sequence remains visual; account and application tasks never require the user to interpret the orb.

## Consequences

- The root public page intentionally loads the Three.js, React Three Fiber, Drei, and GSAP landing bundle; Vite isolates those dependencies into vendor chunks.
- The conventional light landing page and reusable CSS orb are removed, reducing the risk that the agent mark leaks into unrelated screens.
- Account screens and primary cross-route actions now share real React abstractions instead of repeated style literals.
- Existing complex form sections can migrate incrementally without presenting a second visual theme.
- Adding a new entity is primarily a schema and content decision; it does not require a new page design.
- Runtime font loading currently uses Google Fonts. Self-hosting the two approved families is a deployment hardening task if offline rendering or third-party request elimination becomes required.
