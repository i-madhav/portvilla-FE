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
    /* UV → centered -1..1 space */
    vec2 uv = (vUv - 0.5) * 2.0;

    /* ── Outer golden disc ──────────────────────────────────────────────── */
    float dist       = length(uv);
    float circleMask = 1.0 - smoothstep(0.86, 0.91, dist);
    if (circleMask < 0.005) discard;

    /* Subtle vignette: bottom-edge of the disc is slightly darker,
       giving the badge just a hint of weight without being 3-D.           */
    float vignette = 1.0 - 0.18 * smoothstep(0.0, 1.0, uv.y * -0.5 + 0.5);

    /* ── Speaking pulse ─────────────────────────────────────────────────── */
    /* Layered sines feel organic rather than mechanical */
    float breathe = 1.0
      + uAmplitude * (0.10 + 0.06 * sin(uTime * 9.5 ) * 0.38
                           + 0.04 * sin(uTime * 14.8) * 0.22
                           + 0.03 * sin(uTime * 5.1 ) * 0.18);

    /* Scale UV into blob space so the blob grows, not the circle */
    vec2 bp = uv / breathe;

    /* ── Organic cross blob ─────────────────────────────────────────────── */
    /* Vertical pill  — taller than wide, forms the body */
    float blobV = sdRoundBox(bp, vec2(0.130, 0.415), 0.130);
    /* Horizontal bar — wider than tall, forms the arms */
    float blobH = sdRoundBox(bp, vec2(0.390, 0.120), 0.120);
    /* Smooth union: k=0.18 blends junctions into flowing curves */
    float blob     = smin(blobV, blobH, 0.18);
    float blobMask = 1.0 - smoothstep(-0.006, 0.014, blob);

    /* ── Colors ─────────────────────────────────────────────────────────── */
    vec3 gold = vec3(0.961, 0.773, 0.118) * vignette;  /* warm golden yellow  */
    vec3 dark = vec3(0.149, 0.090, 0.055);              /* deep espresso brown */

    vec3 col = mix(gold, dark, blobMask);
    gl_FragColor = vec4(col, circleMask);
  }
`;
