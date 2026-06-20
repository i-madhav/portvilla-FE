import img1Src from '../assets/scene1_1-D7eS8Ahv.webp';
import img2Src from '../assets/scene1_2-BczT2acV.webp';
import img3Src from '../assets/scene1_3-DvxzVzdZ.webp';
import img4Src from '../assets/scene1_4-BWKHjA2B.webp';
import img5Src from '../assets/scene1_5-vIcvqbzi.webp';
import img6Src from '../assets/scene1_6-CHlc-8aL.webp';
import img7Src from '../assets/scene1_7-BXbFlz1e.webp';

export const IMAGE_SRCS = [img1Src, img2Src, img3Src, img4Src, img5Src, img6Src, img7Src];

/** Z positions of each tunnel layer (layer 0 = deepest background) */
export const LAYER_Z = [0, 1.0, 3.6, 3.0, 6.8, 8.4, 10.0];

/** Vertical offset per layer in world units (negative = lower, positive = higher) */
export const LAYER_Y = [0, -3, -2.5, -0.3, 0, 0, 0];

/** Mouse-parallax strength per layer — kept in sync with tunnel depth */
const MAX_LAYER_Z = Math.max(...LAYER_Z);
export const DEPTHS = LAYER_Z.map((z) => (z / MAX_LAYER_Z) * 0.04);

/** Match the 2-D scenery phase's object-fit cover frame */
export const PLANE_SCALE = 1.0;

/** Camera FOV — must match TunnelOverlay Canvas camera */
export const CAM_FOV = 60;

/** Camera starts in front of the closest foreground layer */
export const CAM_START = 18;

/** World-space viewport height at a given camera-to-plane distance (matches R3F viewport) */
export function worldViewportHeightAtDistance(distance: number): number {
  const fovRad = (CAM_FOV * Math.PI) / 180;
  return 2 * Math.tan(fovRad / 2) * distance;
}

/** World-space viewport height for a layer at layerZ when camera is at CAM_START */
export function worldViewportHeightAtLayer(layerZ: number): number {
  return worldViewportHeightAtDistance(CAM_START - layerZ);
}

/** Map 3-D LAYER_Y to CSS translateY px so scenery matches the tunnel handoff frame */
export function layerYToSceneryTranslatePx(
  layerY: number,
  layerZ: number,
  viewportHeightPx: number,
): number {
  return -(layerY / worldViewportHeightAtLayer(layerZ)) * viewportHeightPx;
}

/** Stop just before the opaque background layer */
export const CAM_END = 9.4;

/** Scroll progress (0–1) when orb becomes visible and begins rising from below */
export const ORB_ENTRANCE_START = 0.4;

/** Scroll span (0–1) over which the orb completes its rise */
export const ORB_ENTRANCE_DURATION = 0.15;

/** World Y when orb is off-screen below */
export const ORB_START_Y = -10;

/** World Y when orb rests in center (must match OrbCore resting position) */
export const ORB_END_Y = -0.08;

/** World Z for orb center (docked position uses same depth) */
export const ORB_CENTER_Z = 0.5;

/** GSAP ease name for the rise (scroll-scrubbed via parseEase) */
export const ORB_ENTRANCE_EASE = 'power2.out';

/** Linear 0–1 progress through the entrance window for a given scroll progress */
export function orbEntranceLinearT(scrollProgress: number): number {
  const raw = (scrollProgress - ORB_ENTRANCE_START) / ORB_ENTRANCE_DURATION;
  return Math.max(0, Math.min(1, raw));
}

export interface OrbEntranceState {
  /** Eased entrance progress 0–1 (after GSAP ease) */
  t: number;
  y: number;
}

export const FONT = "'Jura','Inter',sans-serif";