import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icons in public/ from public/favicon.svg.
// Run with: npm run icons
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset,
  images: ['public/favicon.svg'],
});
