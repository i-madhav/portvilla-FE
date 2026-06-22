export const ORB2D_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ORB2D_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uAmplitude;

  varying vec2 vUv;

  /* Signed distance — rounded rectangle */
  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  /* Smooth union — blends two SDFs so junctions look organic, not mechanical */
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;

    float dist = length(uv);

    /* ── Outer aura — sage glow that swells beyond disc when speaking ────── */
    float aDist = max(0.0, dist - 0.88);
    float aura  = (1.0 - smoothstep(0.0, 0.13 * uAmplitude + 0.001, aDist))
                  * uAmplitude * 0.72;

    /* ── Disc mask + combined alpha (disc OR aura) ──────────────────────── */
    float circleMask = 1.0 - smoothstep(0.86, 0.91, dist);
    float alpha      = max(circleMask, aura * (1.0 - circleMask));
    if (alpha < 0.005) discard;

    /* Bottom-edge vignette — badge weight without being 3-D */
    float vignette = 1.0 - 0.18 * smoothstep(0.0, 1.0, uv.y * -0.5 + 0.5);

    /* ── Speaking breathe ───────────────────────────────────────────────── */
    float breathe = 1.0
      + uAmplitude * (0.10 + 0.06 * sin(uTime * 9.5 ) * 0.38
                           + 0.04 * sin(uTime * 14.8) * 0.22
                           + 0.03 * sin(uTime * 5.1 ) * 0.18);
    vec2 bp = uv / breathe;

    /* ── Cross blob ─────────────────────────────────────────────────────── */
    float blobV    = sdRoundBox(bp, vec2(0.130, 0.415), 0.130);
    float blobH    = sdRoundBox(bp, vec2(0.390, 0.120), 0.120);
    float blob     = smin(blobV, blobH, 0.18);
    float blobMask = 1.0 - smoothstep(-0.006, 0.014, blob);

    /* ── Brand palette ──────────────────────────────────────────────────── */
    vec3 sage   = vec3(0.612, 0.690, 0.502);  /* #9CB080 */
    vec3 forest = vec3(0.380, 0.529, 0.392);  /* #618764 */
    vec3 deep   = vec3(0.169, 0.341, 0.282);  /* #2B5748 */
    vec3 ink    = vec3(0.153, 0.200, 0.220);  /* #273338 */

    /* ── Disc background: deep centre → ink edges ───────────────────────── */
    float radial = smoothstep(0.0, 0.90, dist);
    vec3  disc   = mix(deep, ink, radial) * vignette;

    /* ── Animated nebula wisps — organic life in idle state ─────────────── */
    float n1     = sin(uv.x * 3.1 + uTime * 0.26) * sin(uv.y * 2.9 - uTime * 0.21);
    float n2     = sin(uv.x * 5.3 - uTime * 0.13 + 1.2) * sin(uv.y * 4.6 + uTime * 0.18);
    float nebula = (n1 * 0.55 + n2 * 0.35) * max(0.0, 0.82 - dist);
    disc        += forest * clamp(nebula, 0.0, 1.0) * (0.10 + uAmplitude * 0.06);

    /* ── Forest ring at disc edge ───────────────────────────────────────── */
    float ring = smoothstep(0.76, 0.83, dist) * (1.0 - smoothstep(0.83, 0.91, dist));
    disc       = mix(disc, forest, ring * 0.65);

    /* ── Blob colour: forest → sage, brightens fully when speaking ───────── */
    vec3 blobCol = mix(forest, sage, 0.4 + uAmplitude * 0.6);

    /* ── Blob halo — cross radiates light outward into disc ─────────────── */
    float halo = exp(-max(blob, 0.0) * 7.0);
    disc       = disc + blobCol * halo * 0.28;

    /* ── Sonar rings — concentric waves expand from centre when speaking ─── */
    float rings     = fract(dist * 5.8 - uTime * 1.6);
    float sonar     = smoothstep(0.0, 0.10, rings) * (1.0 - smoothstep(0.10, 0.5, rings));
    float sonarFade = smoothstep(0.10, 0.38, dist) * smoothstep(0.85, 0.48, dist);
    disc           += sage * sonar * sonarFade * uAmplitude * 0.32;

    /* ── Compose disc + blob ────────────────────────────────────────────── */
    vec3 col = mix(disc, blobCol, blobMask);

    /* Outside the disc the pixel belongs to the aura — show sage there */
    col = mix(sage * 0.52, col, circleMask);

    gl_FragColor = vec4(col, alpha);
  }
`;
