# Tunnel Transition Fix Plan

## Goal
Fix two bugs in the Phase 2→3 scroll transition of the portvilla-FE landing page.

## Bug 1: Black frame on scroll (Phase 2 → 3)
**Root cause:** `SceneLoader.tsx` lines 77-93 — `jumpToPageTop()` + 400ms hard-coded delay
1. `jumpToPageTop()` scrolls to (0,0), which can re-trigger the scroll listener before it's removed
2. `setTimeout(() => setSceneryOpacity(0), 400)` is a blind delay — doesn't wait for the Three.js canvas to render its first frame
3. Result: scenery fades out, 3D layers aren't ready yet → black frame

**Fix:** Replace the hard 400ms delay with GSAP-driven cross-fade over the first 15% of scroll progress. The scenery opacity fades *gradually* as the user scrolls, giving the tunnel canvas time to paint its first frame.

## Bug 2: EndReveal component is dead (never imported)
**Root cause:** `EndReveal.tsx` is never imported in `SceneLoader.tsx` or `TunnelOverlay.tsx`. The "Portvilla" end text simply never appears.

**Fix:** Import and render `EndReveal` inside `SceneLoader.tsx`, gated on `scrollProgress >= END_PROGRESS` and the last tunnel layer being visibly rendered.

## Files to change
1. `src/components/SceneLoader.tsx` — Fix transition logic, import EndReveal
2. `src/lib/constants.ts` — Add SCENERY_FADE_END constant (optionally)

## Verification
- Build passes with `npm run build`
- Scroll from Phase 2 → Phase 3 with no visible black frame
- End text appears at ~90% scroll
