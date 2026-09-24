import { strToU8, zipSync } from 'fflate';
import { fontAssets, fontPairing } from './fonts';
import { exportCSS, type Palette } from './palette';
import { exportSizeConfig } from './sizing';

export type ExportTarget = 'nuxt' | 'vue';

export function installationGuide(palette: Palette, target: ExportTarget): string {
  const nuxt = target === 'nuxt';
  return `# Your Lavette theme

For an existing ${nuxt ? 'Nuxt' : 'Vue / Vite'} project with Nuxt UI 4 and Tailwind CSS 4.
Tested with Nuxt UI 4.11.1 and Tailwind CSS 4.3.3.
Pairing: ${fontPairing(palette.values.fontPairing).name}. Default control size: ${palette.values.uiSize}.

1. Copy lavette-theme.css next to your existing main stylesheet.
2. Merge public/fonts into your project's public/fonts directory. Keep the licenses.
3. Add the theme import after your existing imports:

\`\`\`css
@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";
\`\`\`

${nuxt ? 'Your main stylesheet must already be registered in nuxt.config.ts (for example css: [\'~/assets/css/main.css\']). Nuxt 4 normally places it in app/assets/css; Nuxt 3 normally uses assets/css.' : 'Your main stylesheet must already be imported by your application entry point.'}

4. Merge the ui entries in lavette-ui.config.ts into ${nuxt ? 'your existing app.config.ts (app/app.config.ts in Nuxt 4)' : 'the existing @nuxt/ui/vite plugin options in vite.config.ts'}. This snippet applies control sizes; it is not auto-loaded. Keep unrelated configuration. Explicit component sizes still take priority.
5. Keep your existing UApp wrapper. ${nuxt ? 'Nuxt Color Mode controls the .dark class.' : 'Toggle the .dark class on the html element to change modes.'}

The stylesheet supplies all seven color ramps; no ui.colors mapping is needed.
Existing custom CSS or inline styles can override the theme. Check your own components in both modes.
Keep the complete stylesheet: its status treatments include readable fills and hover states.
Fonts use /fonts/ URLs. Adjust those URLs if you deploy under a subpath.

## Display headings

Body text and controls use the selected sans font. Opt into the display font:

\`\`\`html
<h1 class="font-display font-normal leading-display tracking-normal">Your next chapter</h1>
\`\`\`

## Theme settings

lavette-theme.json records the exact settings used for this export.
Contrast checks cover generated color pairs and supported states, not whole-site accessibility.
`;
}

/** Fail the entire download if an asset is missing; never ship a partial theme. */
export async function createThemePackage(
  palette: Palette,
  target: ExportTarget,
  fetchAsset: (path: string) => Promise<Uint8Array>,
): Promise<Uint8Array> {
  const assets = fontAssets(palette.values.fontPairing);
  const names = [...new Set(assets.flatMap(asset => [asset.file, asset.license]))];
  const downloaded = await Promise.all(names.map(async name => [
    `public/fonts/${name}`, await fetchAsset(`fonts/${name}`),
  ] as const));
  const files: Record<string, Uint8Array> = {
    'lavette-theme.css': strToU8(exportCSS(palette)),
    'lavette-ui.config.ts': strToU8(exportSizeConfig(palette.values.uiSize, target)),
    'README.md': strToU8(installationGuide(palette, target)),
    'lavette-theme.json': strToU8(JSON.stringify(palette.values, null, 2)),
    ...Object.fromEntries(downloaded),
  };
  // WOFF2 is already compressed; storing entries keeps packaging fast on mobile.
  return zipSync(files, { level: 0 });
}
