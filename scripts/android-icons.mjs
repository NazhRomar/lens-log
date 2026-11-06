// Builds the Android launcher icon and splash images from the Lens Log logo.
// Writes PNG sources to assets/, then @capacitor/assets turns them into every
// density Android needs. Run with: npm run android:icons
import { mkdir, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const BLUE = '#1D5FD1';
const LIGHT_BG = '#F4F6F9';
const DARK_BG = '#0B1220';

// The lens mark on a 1024 canvas. Adaptive icons crop to the middle ~61%,
// so the ring (outer radius ~224) stays well inside that safe zone.
const mark = (scale = 1) => `
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <circle cx="512" cy="512" r="200" fill="none" stroke="#FFFFFF" stroke-width="48"/>
    <path d="M404 464a124 124 0 0 1 86-80" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="32" stroke-linecap="round"/>
  </g>`;

const svg = (body, size = 1024) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`);

const files = {
  // Full icon for older Android versions (the launcher applies its own mask).
  'icon-only.png': svg(`<rect width="1024" height="1024" fill="${BLUE}"/>${mark()}`),
  // Adaptive icon layers (Android 8+).
  'icon-foreground.png': svg(mark()),
  'icon-background.png': svg(`<rect width="1024" height="1024" fill="${BLUE}"/>`),
  // Splash: rounded logo in the middle of a page-colored background.
  'splash.png': svg(
    `<rect width="2732" height="2732" fill="${LIGHT_BG}"/>
     <g transform="translate(1110 1110)"><rect width="512" height="512" rx="112" fill="${BLUE}"/>
     <g transform="scale(0.5)">${mark()}</g></g>`,
    2732,
  ),
  'splash-dark.png': svg(
    `<rect width="2732" height="2732" fill="${DARK_BG}"/>
     <g transform="translate(1110 1110)"><rect width="512" height="512" rx="112" fill="${BLUE}"/>
     <g transform="scale(0.5)">${mark()}</g></g>`,
    2732,
  ),
};

await mkdir('assets', { recursive: true });
for (const [name, data] of Object.entries(files)) {
  await writeFile(`assets/${name}`, await sharp(data).png().toBuffer());
  console.log(`assets/${name}`);
}

execSync(
  `npx capacitor-assets generate --android --iconBackgroundColor "${BLUE}" --splashBackgroundColor "${LIGHT_BG}" --splashBackgroundColorDark "${DARK_BG}"`,
  { stdio: 'inherit' },
);
