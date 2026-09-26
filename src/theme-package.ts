import { strToU8, zipSync } from 'fflate';
import { fontAssets, fontPairing } from './fonts';
import { exportCSS, type Palette } from './palette';

export function installationGuide(palette: Palette): string {
  return `# Your Lavette theme

For an existing Nuxt or Vue / Vite project with Nuxt UI 4 and Tailwind CSS 4.
Tested with Nuxt UI 4.11.1 and Tailwind CSS 4.3.3.
Pairing: ${fontPairing(palette.values.fontPairing).name}.

1. Copy lavette-theme.css next to your existing main stylesheet.
2. Merge public/fonts into your project's public/fonts directory. Keep the licenses.
3. Add the theme import after your existing imports:

\`\`\`css
@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";
\`\`\`

In Nuxt, register your main stylesheet in nuxt.config.ts (for example css: ['~/assets/css/main.css']). Nuxt 4 normally places it in app/assets/css; Nuxt 3 normally uses assets/css.
In Vue / Vite, import your main stylesheet in your application entry point.

4. Keep your existing UApp wrapper. Toggle the .dark class on the html element to change modes, using Nuxt Color Mode if your app already has it.

Nuxt UI's default control sizes are preserved. No theme configuration file is needed.
The stylesheet supplies all seven color ramps; no ui.colors mapping is needed.
Existing custom CSS or inline styles can override the theme. Check your own components in both modes.
Keep the complete stylesheet: its status treatments include readable fills and hover states.
Fonts use /fonts/ URLs. Adjust those URLs if you deploy under a subpath.

## Display headings

Body text and controls use the selected sans font. Opt into the display font:

\`\`\`html
<h1 class="font-display font-normal leading-display tracking-normal">Your next chapter</h1>
\`\`\`

## Contrast

Contrast checks cover generated color pairs and supported states, not whole-site accessibility.
`;
}

/** Fail the entire download if an asset is missing; never ship a partial theme. */
export async function createThemePackage(
  palette: Palette,
  fetchAsset: (path: string) => Promise<Uint8Array>,
): Promise<Uint8Array> {
  const assets = fontAssets(palette.values.fontPairing);
  const names = [...new Set(assets.flatMap(asset => [asset.file, asset.license]))];
  const downloaded = await Promise.all(names.map(async name => [
    `public/fonts/${name}`, await fetchAsset(`fonts/${name}`),
  ] as const));
  const files: Record<string, Uint8Array> = {
    'lavette-theme.css': strToU8(exportCSS(palette)),
    'README.md': strToU8(installationGuide(palette)),
    ...Object.fromEntries(downloaded),
  };
  // WOFF2 is already compressed; storing entries keeps packaging fast on mobile.
  return zipSync(files, { level: 0 });
}
