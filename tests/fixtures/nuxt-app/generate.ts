import { mkdir, writeFile } from 'node:fs/promises';
import { generatePalette } from '../../../src/palette';
import { exportUiConfig } from '../../../src/ui-config';
import { exportCSS } from '../../../src/theme';

const destination = new URL('app/assets/css/lavette-theme.css', import.meta.url);
await mkdir(new URL('.', destination), { recursive: true });
await writeFile(destination, exportCSS(generatePalette({
  harmony: 'analogous', hue: 185, character: 50, paperWarmth: 30,
})));

await writeFile(new URL('lavette-ui.config.ts', import.meta.url), exportUiConfig(generatePalette({ iconSet: process.env.ICON_SET }).values));
await writeFile(new URL('app/app.config.ts', import.meta.url), `import { uiTheme } from '../lavette-ui.config';
export default defineAppConfig({ ui: uiTheme });
`);
