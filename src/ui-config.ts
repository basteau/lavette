import type { PaletteValues } from './palette';
import { iconPresets } from './icons';

/** Shared data can be imported by both app.config.ts and nuxt.config.ts. */
export function exportUiConfig(values: PaletteValues): string {
  const config = { icons: iconPresets[values.iconSet].ui };
  return `// Import into your existing Nuxt app config or @nuxt/ui/vite options.\nimport type { NuxtUIOptions } from '@nuxt/ui/unplugin';\n\nexport const uiTheme = ${JSON.stringify(config, null, 2)} as const satisfies NonNullable<NuxtUIOptions['ui']>;\n\nexport const iconBundle = [...new Set(Object.values(uiTheme.icons))];\n`;
}
