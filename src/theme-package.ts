import { strToU8, zipSync } from 'fflate';
import { fontAssets, fontPairing } from './fonts';
import { exportCSS, type Palette } from './palette';

function installationGuide(palette: Palette): string {
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

Your main stylesheet should already be loaded by your app: through the css option
in nuxt.config.ts for Nuxt, or an import in your entry point for Vue / Vite.

Keep the complete theme CSS and your existing UApp wrapper. No additional
configuration is needed; your app's component sizes continue to apply.
If your app uses a subpath, adjust the /fonts/ URLs in the CSS.

## Dark mode

Toggle the .dark class on the html element, using Nuxt Color Mode if installed.
Check your components in both modes, including hover and keyboard focus states.

## Display headings

Body text and controls use the selected sans font. Opt into the display font:

\`\`\`html
<h1 class="font-display font-normal leading-display tracking-normal">Your next chapter</h1>
\`\`\`

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
