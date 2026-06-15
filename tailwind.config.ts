/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep Void Palette — Matching the metallic magenta/purple aesthetic
        background: "#000000",
        "surface": "#020202",
        "surface-dim": "#000000",
        "surface-bright": "#111111",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#050505",
        "surface-container": "#0a0a0a",
        "surface-container-high": "#111111",
        "surface-container-highest": "#1a1a1a",
        "on-surface": "#e0e0e0",
        "on-surface-variant": "#a0a0a0",
        "outline": "#4a4a4a",
        "outline-variant": "#2a2a2a",
        "surface-tint": "#ff00cc",
        
        // Primary — Magenta/Pink
        "primary": "#ff33dd",
        "on-primary": "#4a0033",
        "primary-container": "#ff00cc",
        "on-primary-container": "#ffe6f9",
        "primary-fixed": "#ff66ee",
        "primary-fixed-dim": "#ff00cc",
        "on-primary-fixed": "#330022",
        "on-primary-fixed-variant": "#5c0044",
        "inverse-primary": "#8f0066",
        
        // Secondary — Purple/Cyan mix (from the lighting)
        "secondary": "#00d4ff",
        "on-secondary": "#00334a",
        "secondary-container": "#5a00ff",
        "on-secondary-container": "#e6d9ff",
        "secondary-fixed": "#00d4ff",
        "secondary-fixed-dim": "#00b1d6",
        "on-secondary-fixed": "#001a24",
        "on-secondary-fixed-variant": "#00405c",
        
        // Tertiary
        "tertiary": "#d0dffc",
        "on-tertiary": "#223147",
        "tertiary-container": "#3a2a5a",
        "on-tertiary-container": "#d9ccff",
        "tertiary-fixed": "#d5e3ff",
        "tertiary-fixed-dim": "#b8c7e3",
        "on-tertiary-fixed": "#0c1c31",
        "on-tertiary-fixed-variant": "#39475f",
        
        // Error
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        
        // Inverse
        "inverse-surface": "#e0e0e0",
        "inverse-on-surface": "#1a1a1a",
        "on-background": "#e0e0e0",
        "surface-variant": "#1a1a1a",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["64px", { lineHeight: "72px", letterSpacing: "-0.04em", fontWeight: "700" }],
        "headline-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "0em", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      spacing: {
        "unit-xs": "4px",
        "unit-sm": "8px",
        "unit-md": "16px",
        "unit-lg": "32px",
        "unit-xl": "64px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "container-max": "1440px",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom, #0A1A2F, #0B2D5E)",
        "cyan-glow": "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin-reverse 15s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "spin-reverse": {
          from: { transform: "translate(-50%, -50%) rotateX(70deg) rotateZ(360deg)" },
          to: { transform: "translate(-50%, -50%) rotateX(70deg) rotateZ(0deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(3)", opacity: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%": { boxShadow: "0 0 50px rgba(0, 212, 255, 0.7)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      maxWidth: {
        "container-max": "1440px",
      },
    },
  },
  plugins: [],
};
