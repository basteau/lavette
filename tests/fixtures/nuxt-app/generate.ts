import { mkdir, writeFile } from 'node:fs/promises';
import { generatePalette, exportCSS } from '../../../src/palette';

const destination = new URL('app/assets/css/lavette-theme.css', import.meta.url);
await mkdir(new URL('.', destination), { recursive: true });
await writeFile(destination, exportCSS(generatePalette({
  harmony: 'analogous', hue: 185, character: 50, paperWarmth: 30,
})));
