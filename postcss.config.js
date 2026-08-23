import { fileURLToPath } from 'node:url';

const tailwindConfig = fileURLToPath(new URL('./tailwind.config.ts', import.meta.url));

export default {
  plugins: {
    // Bind Tailwind to this app's config even when Vite is started by an IDE or
    // from a parent workspace. This also makes config changes deterministic
    // across npm and pnpm installations.
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
};
