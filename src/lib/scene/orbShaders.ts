/* ── Simplex 3-D Noise (Stefan Gustavson / Ian McEwan) ───────────────────────
   Helper functions are prefixed with _orb_ to avoid collisions with any
   Three.js built-in shader chunks that may be injected at compile time.  */
const NOISE_GLSL = /* glsl */`
  vec3  _orb_mod289v3(vec3 x)  { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4  _orb_mod289v4(vec4 x)  { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4  _orb_permute(vec4 x)   { return _orb_mod289v4(((x*34.0)+10.0)*x); }
  vec4  _orb_taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = _orb_mod289v3(i);
    vec4 p = _orb_permute(_orb_permute(_orb_permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns  = n_ * D.wyz - D.xzx;
    vec4 j    = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_   = floor(j * ns.z);
    vec4 y_   = floor(j - 7.0 * x_);
    vec4 x    = x_ * ns.x + ns.yyyy;
    vec4 y    = y_ * ns.x + ns.yyyy;
    vec4 h    = 1.0 - abs(x) - abs(y);
    vec4 b0   = vec4(x.xy, y.xy);
    vec4 b1   = vec4(x.zw, y.zw);
    vec4 s0   = floor(b0) * 2.0 + 1.0;
    vec4 s1   = floor(b1) * 2.0 + 1.0;
    vec4 sh   = -step(h, vec4(0.0));
    vec4 a0   = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1   = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0   = vec3(a0.xy, h.x);
    vec3 p1   = vec3(a0.zw, h.y);
    vec3 p2   = vec3(a1.xy, h.z);
    vec3 p3   = vec3(a1.zw, h.w);
    vec4 norm = _orb_taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  /* 5-octave fractal Brownian motion */
  float _orb_fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }
`;

/* ── Shared brand / scene palette ────────────────────────────────────────────
   Keyed to the cave scene: turquoise sea + warm cream-and-amber stone.       */
const PALETTE_GLSL = /* glsl */`
  const vec3 C_ABYSS = vec3(0.010, 0.035, 0.055);  /* near-black teal — deepest interior */
  const vec3 C_TEAL  = vec3(0.035, 0.205, 0.245);  /* deep ocean teal                    */
  const vec3 C_TURQ  = vec3(0.090, 0.470, 0.510);  /* turquoise marbling                 */
  const vec3 C_AQUA  = vec3(0.520, 0.850, 0.840);  /* bright aqua highlight              */
  const vec3 C_CREAM = vec3(0.970, 0.910, 0.795);  /* warm cream — cave stone / specular */
  const vec3 C_AMBER = vec3(0.820, 0.560, 0.300);  /* warm amber glint                   */
  const float PI = 3.14159265;
`;

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN ORB — opaque polished glass marble
   Smooth noise-displaced shell with a domain-warped marbled interior,
   subsurface core glow, fake environment reflection, and a crisp specular.
══════════════════════════════════════════════════════════════════════════════ */
export const ORB_MAIN_VERT = /* glsl */`
  ${NOISE_GLSL}

  uniform float uTime;
  uniform float uAmplitude;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vObjPos;     /* undisplaced object-space position — stable interior */

  void main() {
    vec3 n = normalize(normal);

    /* Gentle low-amplitude breathing — glass stays mostly spherical & smooth */
    float f1 = snoise(n * 1.5 + uTime * 0.22);
    float f2 = snoise(n * 3.0 + uTime * 0.40 + 1.8) * 0.5;
    float baseNoise = (f1 + f2) / 1.5;

    /* Audio-reactive swell — smooth, low-freq so it reads as a soft pulse */
    float audioNoise = snoise(n * 4.5 + uTime * 2.0 + 5.5) * uAmplitude;

    float disp = baseNoise * 0.020 + audioNoise * 0.055;
    vec3 displaced = position + n * disp;

    vObjPos   = position;
    vNormal   = normalMatrix * n;
    vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const ORB_MAIN_FRAG = /* glsl */`
  ${NOISE_GLSL}
  ${PALETTE_GLSL}

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uGlow;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vObjPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotV = max(dot(N, V), 0.0);

    /* Fresnel — 0 at centre, 1 at the silhouette */
    float fres = pow(1.0 - NdotV, 3.0);

    /* ── Marbled interior: domain-warped fBm in object space ──────────────
       Stable in object space, so the swirl rotates *with* the orb like real
       suspended pigment, instead of crawling across the screen.            */
    vec3  q     = vObjPos * 2.1;
    float warp  = _orb_fbm(q + uTime * 0.045);
    float swirl = _orb_fbm(q + vec3(warp * 1.6) + uTime * 0.06);
    swirl = swirl * 0.5 + 0.5;

    /* Depth shading: looking *into* the glass darkens toward the core */
    vec3 interior = mix(C_ABYSS, C_TEAL, swirl);
    interior = mix(interior, C_TURQ, smoothstep(0.45, 0.95, swirl) * 0.85);

    /* Subsurface luminance — light scattering up from inside the core */
    float core = pow(NdotV, 2.4);
    interior += C_AQUA * core * (0.18 + uGlow * 0.32) * (0.55 + swirl * 0.5);

    /* ── Fake environment reflection (sells the glass) ────────────────────
       Reflect the view vector and read a vertical sky→ground gradient.     */
    vec3  R    = reflect(-V, N);
    float envY = R.y * 0.5 + 0.5;
    vec3  env  = mix(C_TEAL * 0.6, C_CREAM, smoothstep(0.25, 0.95, envY));

    /* ── Specular hotspot — fake key light upper-left ─────────────────────── */
    vec3  L     = normalize(vec3(-0.55, 0.85, 0.65));
    vec3  H     = normalize(L + V);
    float NdotH = max(dot(N, H), 0.0);
    float spec  = pow(NdotH, 140.0);          /* tight glossy highlight */
    float spec2 = pow(NdotH, 28.0) * 0.30;    /* broad soft sheen       */

    /* ── Composite ────────────────────────────────────────────────────────── */
    vec3 col = interior;
    col  = mix(col, env, fres * 0.45);                 /* reflective rim       */
    col += C_CREAM * spec * 1.8;                        /* hot glass highlight  */
    col += C_AQUA  * spec2;                             /* secondary sheen      */
    col += C_CREAM * pow(fres, 1.6) * 0.22;             /* cool rim light       */
    col += C_AMBER * fres * 0.12;                       /* warm rim — ties to stone */
    col *= (0.85 + uGlow * 0.40);
    col += C_AQUA  * uAmplitude * 0.35 * (0.4 + fres);  /* audio pulse          */

    /* OPAQUE — you cannot see through the glass */
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/* ══════════════════════════════════════════════════════════════════════════════
   INNER CORE — soft luminous heart glowing up through the glass (additive)
   Drawn over the opaque body; a gentle radial glow that pulses with the voice.
══════════════════════════════════════════════════════════════════════════════ */
export const ORB_INNER_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ORB_INNER_FRAG = /* glsl */`
  ${PALETTE_GLSL}

  uniform float uTime;
  uniform float uGlow;
  uniform float uAmplitude;

  varying vec2 vUv;

  void main() {
    float d    = length(vUv - 0.5) * 2.0;          /* 0 = centre, 1 = edge */
    float glow = pow(1.0 - smoothstep(0.0, 0.95, d), 2.4);

    float pulse = sin(uTime * 1.9) * 0.10 + 1.0 + uAmplitude * 0.60;

    /* Warm aqua heart fading to turquoise */
    vec3 col = mix(C_TURQ, C_AQUA, glow);
    col *= glow * pulse * (0.45 + uGlow * 0.45);

    /* Subtle at rest, blooms when speaking / glowing */
    float alpha = glow * (0.22 + uGlow * 0.20 + uAmplitude * 0.30);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/* ══════════════════════════════════════════════════════════════════════════════
   OUTER HALO — soft atmospheric corona (additive), scene-matched & restrained
══════════════════════════════════════════════════════════════════════════════ */
export const ORB_HALO_VERT = /* glsl */`
  ${NOISE_GLSL}

  uniform float uTime;
  uniform float uAmplitude;

  varying vec3  vNormal;
  varying vec3  vWorldPos;
  varying float vWave;

  void main() {
    vec3 n = normalize(normal);

    /* Traveling waves rippling across the corona:
       two crossing sine bands + a drifting noise swell, all moving in time. */
    float w1 = sin(n.y * 7.0 - uTime * 2.2);
    float w2 = sin(n.x * 5.0 + n.z * 5.0 + uTime * 1.6) * 0.6;
    float w3 = snoise(n * 2.6 + vec3(0.0, 0.0, uTime * 0.6)) * 0.9;
    float wave = (w1 + w2 + w3) / 2.5;          /* ≈ [-1, 1] */

    /* Crests swell with the voice */
    float amp = 0.075 * (1.0 + uAmplitude * 1.8);
    vec3 displaced = position + n * wave * amp;

    vWave     = wave;
    vNormal   = normalMatrix * n;
    vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const ORB_HALO_FRAG = /* glsl */`
  ${PALETTE_GLSL}

  uniform float uTime;
  uniform float uGlow;
  uniform float uAmplitude;

  varying vec3  vNormal;
  varying vec3  vWorldPos;
  varying float vWave;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotV = max(dot(N, V), 0.0);

    float rim = pow(1.0 - NdotV, 4.0);

    /* Wave crests (vWave > 0) read brighter and more aqua */
    float crest = max(vWave, 0.0);

    float t1 = sin(uTime * 0.30) * 0.5 + 0.5;
    vec3  haloCol = mix(C_TEAL, C_TURQ, t1);
    haloCol = mix(haloCol, C_AQUA, crest * 0.6 + uAmplitude * 0.4);

    float pulse = sin(uTime * 1.5) * 0.08 + 1.0 + uAmplitude * 0.45;

    vec3  col   = haloCol * (1.0 + crest * 0.8 + uAmplitude * 0.5);
    float alpha = rim * (0.28 + uGlow * 0.30) * pulse * (0.7 + crest * 0.7);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
