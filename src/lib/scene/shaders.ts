export const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const FRAG = /* glsl */`
  uniform sampler2D uTexture;
  uniform float     uScrollVelocity;
  uniform float     uPlaneAspect;
  uniform float     uTexAspect;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    /* Object-fit: cover — sample a centred sub-range of the texture on the
       cropped axis (multiply). Dividing instead expands uv past [0,1], and
       ClampToEdgeWrapping then smears the edge rows across the overflow. */
    if (uTexAspect > uPlaneAspect) {
      uv.x = (uv.x - 0.5) * (uPlaneAspect / uTexAspect) + 0.5;
    } else {
      uv.y = (uv.y - 0.5) * (uTexAspect / uPlaneAspect) + 0.5;
    }

    /* Barrel distortion */
    float vel   = uScrollVelocity;
    float speed = abs(vel);
    vec2  c     = uv - 0.5;
    float r2    = dot(c, c);
    float barrel = 1.0 + vel * 0.05 * r2;
    uv = c * barrel + 0.5;

    /* Clamp */
    uv = clamp(uv, 0.001, 0.999);

    /* Chromatic aberration */
    float ca = speed * 0.004;
    vec4 base = texture2D(uTexture, uv);
    vec4 col;
    col.r = texture2D(uTexture, clamp(uv + vec2( ca, 0.0), 0.001, 0.999)).r;
    col.g = base.g;
    col.b = texture2D(uTexture, clamp(uv - vec2( ca, 0.0), 0.001, 0.999)).b;

    /* Speed glow */
    col.rgb = min(col.rgb + speed * 0.05, 1.0);
    col.a   = base.a;

    gl_FragColor = col;

    /* Textures are sRGB-decoded to linear on sample; built-in materials
       re-encode on output but a raw ShaderMaterial does not. Without this
       the tunnel renders darker than the DOM <img> scenery, breaking the
       2-D → 3-D handoff. Target-aware, so the EffectComposer path (linear
       buffer) stays correct. */
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
