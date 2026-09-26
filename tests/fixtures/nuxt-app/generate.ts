import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import { generatePalette } from '../../../src/palette';
import { createThemePackage } from '../../../src/theme-package';

// Remove the generated size override left by older fixture runs.
await rm(new URL('app/app.config.ts', import.meta.url), { force: true });
const files = unzipSync(await createThemePackage(generatePalette({
  recipe: 'tonal', hue: 185, mood: 45, depth: 45, paperWarmth: 30,
}), async path => new Uint8Array(await readFile(new URL(`../../../public/${path}`, import.meta.url)))));
for (const [path, contents] of Object.entries(files)) {
  const destination = path === 'lavette-theme.css' ? 'app/assets/css/lavette-theme.css'
    : path.startsWith('public/') ? path : undefined;
  if (!destination) continue;
  const url = new URL(destination, import.meta.url);
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, contents);
}
