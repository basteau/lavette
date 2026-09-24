import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import { generatePalette } from '../../../src/palette';
import { createThemePackage } from '../../../src/theme-package';

const files = unzipSync(await createThemePackage(generatePalette({
  recipe: 'tonal', hue: 185, mood: 45, depth: 45, paperWarmth: 30, uiSize: 'lg',
}), 'nuxt', async path => new Uint8Array(await readFile(new URL(`../../../public/${path}`, import.meta.url)))));
for (const [path, contents] of Object.entries(files)) {
  const destination = path === 'lavette-theme.css' ? 'app/assets/css/lavette-theme.css'
    : path === 'lavette-ui.config.ts' ? 'app/app.config.ts'
    : path.startsWith('public/') ? path : undefined;
  if (!destination) continue;
  const url = new URL(destination, import.meta.url);
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, contents);
}
