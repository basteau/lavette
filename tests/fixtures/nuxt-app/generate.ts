import { mkdir, rm, writeFile } from 'node:fs/promises';
import { generatePalette, exportCSS } from '../../../src/palette';

// Clean generated artifacts from the previous ZIP-based fixture.
await rm(new URL('app/app.config.ts', import.meta.url), { force: true });
await rm(new URL('public/fonts/', import.meta.url), { force: true, recursive: true });
const destination = new URL('app/assets/css/lavette-theme.css', import.meta.url);
await mkdir(new URL('.', destination), { recursive: true });
await writeFile(destination, exportCSS(generatePalette({
  recipe: 'tonal', hue: 185, mood: 45, depth: 45, paperWarmth: 30,
})));
