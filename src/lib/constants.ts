import img1Src from '../assets/scene1_1-D7eS8Ahv.webp';
import img2Src from '../assets/scene1_2-BczT2acV.webp';
import img3Src from '../assets/scene1_3-DvxzVzdZ.webp';
import img4Src from '../assets/scene1_4-BWKHjA2B.webp';
import img5Src from '../assets/scene1_5-vIcvqbzi.webp';
import img6Src from '../assets/scene1_6-CHlc-8aL.webp';
import img7Src from '../assets/scene1_7-BXbFlz1e.webp';

export const IMAGE_SRCS = [img1Src, img2Src, img3Src, img4Src, img5Src, img6Src, img7Src];

export const DEPTHS = [0, 0.008, 0.015, 0.022, 0.028, 0.034, 0.040];

/** Z positions of each tunnel layer (layer 0 = deepest background) */
export const LAYER_Z = [0, 2.0, 3.6, 5.2, 6.8, 8.4, 10.0];

/** Match the 2-D scenery phase's object-fit cover frame */
export const PLANE_SCALE = 1.0;

/** Camera starts in front of the closest foreground layer */
export const CAM_START = 18;

/**
 * Stop at a comfortable distance from the deepest background layer (Z=0).
 *
 * Why 4.0 instead of the previous 1.4:
 *   - At 1.4 the camera flies *past* all scenic layers, right up against the
 *     background texture (Z=0) — the result is a pixelated, zoomed-in mess by
 *     the time the orb appears at ~Z=4.4 (progress 0.9).
 *   - At 4.0 the camera sits ~4 units in front of the background layer:
 *     enough distance for the texture to render cleanly, while foreground
 *     layers (Z=5–10) still provide depth context ahead of the camera.
 *   - The last 10 % of scroll only moves from Z ≈ 4.4 → 4.0, giving a stable
 *     resting position when the orb + waitlist are visible.
 */
export const CAM_END = 4.0;

/** Scroll progress at which the end wordmark appears */
export const END_PROGRESS = 0.9;

/**
 * Scroll progress thresholds for the end-reveal → orb handoff sequence:
 *   1. Text slides up from below (END_TEXT_ENTER)
 *   2. Text holds at center for a moment
 *   3. Text slides down and fades out (END_TEXT_EXIT)
 *   4. Orb becomes visible (ORB_ENTER)
 */
export const END_TEXT_ENTER = 0.86;
export const END_TEXT_EXIT  = 0.92;
export const ORB_ENTER      = 0.94;

export const FONT = "'Jura','Inter',sans-serif";
