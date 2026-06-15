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

/** Stop just before the opaque background layer */
export const CAM_END = 1.4;

/** Scroll progress at which the end wordmark appears */
export const END_PROGRESS = 0.9;

export const FONT = "'Jura','Inter',sans-serif";
