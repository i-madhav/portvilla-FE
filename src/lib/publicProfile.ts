// ─── Public profile address ──────────────────────────────────────────────────
// The address was hardcoded as the literal string "portvilla.in/" in four
// separate components, none of which linked anywhere. Deriving it in one place
// keeps the displayed address, the real href, and the copied text in agreement —
// and keeps them honest in dev, where the host is localhost, not portvilla.in.

/** Host shown to the user. Overridable per environment. */
const DISPLAY_HOST = import.meta.env.VITE_PUBLIC_PROFILE_HOST ?? 'portvilla.in';

/** The address as the user reads it, e.g. "portvilla.in/jane". */
export function publicProfileLabel(username: string): string {
  return `${DISPLAY_HOST}/${username}`;
}

/**
 * The address as a browser follows it.
 *
 * Uses the current origin so the link actually resolves wherever the app is
 * running — a hardcoded https://portvilla.in/… would send every local and
 * preview user to production.
 */
export function publicProfileUrl(username: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : `https://${DISPLAY_HOST}`;
  return `${origin}/${username}`;
}
