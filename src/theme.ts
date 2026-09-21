import { fontFaces, fontTokens, fontPairing, typographyTokens } from "./fonts";
import { converter, wcagContrast, type Oklch } from "culori";
import type { Palette, PaletteCheck, PaletteValues } from "./palette";

export const THEME_ROLES = ["primary", "secondary", "success", "info", "warning", "error", "neutral"] as const;
export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ThemeRole = typeof THEME_ROLES[number];
export type Shade = typeof SHADES[number];
export type ColorMode = "light" | "dark";
export type Tokens = Record<`--${string}`, string>;
export interface Theme {
  seeds: Record<ThemeRole, Oklch>;
  scales: Record<ThemeRole, Record<Shade, Oklch>>;
  tokens: Tokens;
  modes: Record<ColorMode, Tokens>;
  checks: Record<ColorMode, PaletteCheck[]>;
}
const linear = converter("lrgb");
const rgb = converter("rgb");
const oklch = converter("oklch");
const fmt = (c: Oklch) => `oklch(${c.l} ${c.c} ${c.h})`;
const round = (v: number) => Math.round(v * 1e6) / 1e6;
const wrap = (h: number) => (h % 360 + 360) % 360;
const weights = [6, 12, 24, 42, 65, 100, 85, 70, 55, 40, 25];

// Status identity is fixed; mood/depth provide restrained tonal integration.
export const STATUS_HUES = { success: 150, info: 250, warning: 85, error: 25 } as const;
export function mixShade(seed: Oklch, shade: Shade): Oklch {
  const i = SHADES.indexOf(shade);
  const t = weights[i] / 100;
  return { mode: "oklch", l: seed.l * t + (shade < 500 ? 1 - t : 0), c: seed.c * t, h: seed.h };
}
function displayable(c: Oklch): boolean {
  const v = linear(c);
  return [v.r, v.g, v.b].every(n => n >= -1e-7 && n <= 1 + 1e-7);
}
function seed(l: number, requestedC: number, h: number): Oklch {
  let lo = 0, hi = requestedC;
  // Fit the entire emitted mix path, not just its 500 seed.
  for (let i = 0; i < 22; i++) {
    const c = (lo + hi) / 2;
    const candidate: Oklch = { mode: "oklch", l, c, h };
    if (SHADES.every(shade => displayable(mixShade(candidate, shade)))) lo = c;
    else hi = c;
  }
  return { mode: "oklch", l: round(l), c: Math.floor(lo * 0.998 * 1e6) / 1e6, h: round(wrap(h)) };
}
// CSS source-over alpha compositing occurs in sRGB, not OKLCH.
export function composite(fg: Oklch, bg: Oklch, opacity: number) {
  const f = rgb(fg), b = rgb(bg);
  return { mode: "rgb" as const, r: f.r * opacity + b.r * (1 - opacity), g: f.g * opacity + b.g * (1 - opacity), b: f.b * opacity + b.b * (1 - opacity) };
}

export function generateTheme(values: PaletteValues, colors: Palette["colors"]): Theme {
  const { mood, depth, paperWarmth } = values;
  const l = 0.66 - depth * 0.0006;
  const c = 0.075 + mood * 0.0011;
  const primaryHue = colors.accent.h!;
  const primary = seed(l, c, primaryHue);
  // Derive tonal secondary from the fitted primary, so gamut clipping cannot
  // collapse both roles to the same chroma at saturated hues.
  const secondaryChroma = values.recipe === "tonal" ? primary.c * 0.45 : c * 0.8;
  const statusDepth = depth * 0.0002;
  const seeds = {
    primary,
    secondary: seed(l, secondaryChroma, colors.support.h!),
    success: seed(0.68 - statusDepth, 0.17 + mood * 0.0002, STATUS_HUES.success),
    info: seed(0.66 - statusDepth, 0.18 + mood * 0.0002, STATUS_HUES.info),
    warning: seed(0.76 - statusDepth, 0.15 + mood * 0.0001, STATUS_HUES.warning),
    error: seed(0.64 - statusDepth, 0.21 + mood * 0.0002, STATUS_HUES.error),
    neutral: seed(0.58, 0.004 + paperWarmth * 0.00016, colors.ink.h!),
  };
  const scales = {} as Theme["scales"];
  const tokens: Tokens = {
    "--ui-focus-offset": `${values.focusOffset}px`,
    "--ui-radius": `${values.radius}rem`,
    "--ui-container": "80rem",
    "--ui-header-height": "4rem",
    ...fontTokens(values.fontPairing),
    ...typographyTokens(values.fontPairing),
  };
  for (const role of THEME_ROLES) {
    scales[role] = {} as Record<Shade, Oklch>;
    for (const [i, shade] of SHADES.entries()) {
      scales[role][shade] = mixShade(seeds[role], shade);
      tokens[`--ui-color-${role}-${shade}`] = shade === 500 ? fmt(seeds[role])
        : `color-mix(in oklab, var(--ui-color-${role}-500) ${weights[i]}%, ${shade < 500 ? "white" : "black"})`;
    }
  }
  const modes = {} as Theme["modes"];
  const checks = {} as Theme["checks"];
  const n = scales.neutral;
  const alias = (shade: Shade) => `var(--ui-color-neutral-${shade})`;
  for (const mode of ["light", "dark"] as const) {
    const dark = mode === "dark";
    const bg = dark ? n[950] : colors.canvas;
    const inverted = dark ? n[950] : colors.canvas;
    // Accented is deliberately usable behind ordinary text, including dark mode.
    const surfaces = [bg, n[dark ? 900 : 50], n[dark ? 800 : 100], n[dark ? 800 : 200]];
    const m: Tokens = {
      "--ui-bg": dark ? alias(950) : fmt(colors.canvas),
      "--ui-bg-muted": alias(dark ? 900 : 50),
      "--ui-bg-elevated": alias(dark ? 800 : 100),
      "--ui-bg-accented": alias(dark ? 800 : 200),
      "--ui-bg-inverted": dark ? fmt(colors.canvas) : alias(950),
      "--ui-text-dimmed": alias(dark ? 300 : 600),
      "--ui-text-muted": alias(dark ? 200 : 700),
      "--ui-text-toned": alias(dark ? 100 : 800),
      "--ui-text": alias(dark ? 100 : 900),
      "--ui-text-highlighted": dark ? fmt(colors.canvas) : alias(950),
      "--ui-text-inverted": dark ? alias(950) : fmt(colors.canvas),
      "--ui-border": alias(dark ? 700 : 200),
      "--ui-border-muted": alias(dark ? 800 : 100),
      "--ui-border-accented": alias(dark ? 400 : 500),
      "--ui-border-inverted": dark ? fmt(colors.canvas) : alias(950),
    };
    checks[mode] = [];
    const add = (label: string, ratio: number, target = 4.5) => checks[mode].push({ label, ratio, target });
    for (const role of THEME_ROLES.filter(r => r !== "neutral")) {
      const candidates: Shade[] = dark ? [400, 300, 200, 100, 50] : [600, 700, 800, 900, 950];
      const passes = (shade: Shade) => surfaces.every(surface => {
        const value = scales[role][shade];
        return wcagContrast(value, composite(value, surface, 0.15)) >= 4.6
          && wcagContrast(inverted, composite(value, surface, 0.75)) >= 4.6
          && wcagContrast(composite(value, surface, 0.75), surface) >= 4.6;
      });
      const shade = candidates.find(passes) ?? candidates[candidates.length - 1];
      const value = scales[role][shade];
      m[`--ui-${role}`] = `var(--ui-color-${role}-${shade})`;
      add(`${role} text / surfaces`, Math.min(...surfaces.map(s => wcagContrast(value, s))));
      add(`${role} soft + hover`, Math.min(...surfaces.map(s => wcagContrast(value, composite(value, s, 0.15)))));
      add(`${role} solid label + hover`, Math.min(wcagContrast(value, inverted), ...surfaces.map(s => wcagContrast(inverted, composite(value, s, 0.75)))));
      add(`${role} link hover`, Math.min(...surfaces.map(s => wcagContrast(composite(value, s, 0.75), s))));
    }
    for (const [label, shade] of [["Dimmed", dark ? 300 : 600], ["Muted", dark ? 200 : 700], ["Body", dark ? 100 : 900]] as const) {
      add(`${label} text / surfaces`, Math.min(...surfaces.map(s => wcagContrast(n[shade], s))));
    }
    add("Accented control border / surfaces", Math.min(...surfaces.map(surface => wcagContrast(n[dark ? 400 : 500], surface))), 3);
    modes[mode] = m;
  }
  return { seeds, scales, tokens, modes, checks };
}

/** Show brand base colors; background/text follow the active mode.
 * Component aliases remain independently selected for text and state contrast. */
export function corePaletteColors(palette: Palette, mode: ColorMode) {
  const tokens = { ...palette.theme.tokens, ...palette.theme.modes[mode] };
  // Culori does not parse color-mix(); use the exactly equivalent generated ramps.
  for (const role of THEME_ROLES) for (const shade of SHADES) {
    tokens[`--ui-color-${role}-${shade}`] = fmt(palette.theme.scales[role][shade]);
  }
  const resolve = (token: string): Oklch => {
    const value = tokens[token as keyof typeof tokens];
    const reference = /^var\((--[\w-]+)\)$/.exec(value);
    if (reference) return resolve(reference[1]);
    const color = oklch(value);
    if (!color) throw new Error(`Unresolved theme color: ${token}`);
    return color;
  };
  return [
    { label: "Background", token: "--ui-bg" },
    { label: "Text", token: "--ui-text" },
    { label: "Primary", token: "--ui-color-primary-500" },
    { label: "Secondary", token: "--ui-color-secondary-500" },
  ].map(swatch => ({ ...swatch, color: resolve(swatch.token) }));
}

export function declarations(tokens: Tokens): string {
  return Object.entries(tokens).map(([key, value]) => `  ${key}: ${value};`).join("\n");
}
export const focusStyles = `/* Native controls get a clear fallback; Nuxt UI keeps its variant-specific halos. */
@layer base {
  :focus-visible { outline: 2px solid var(--ui-primary); }
}
:focus-visible { outline-offset: var(--ui-focus-offset, 0px); }
`;
export function themeStyles(palette: Palette): string {
  return `:root {\n${declarations({ ...palette.theme.tokens })}\n}\n\n:root, .light {\n  color-scheme: light;\n${declarations(palette.theme.modes.light)}\n}\n\n.dark {\n  color-scheme: dark;\n${declarations(palette.theme.modes.dark)}\n}\n`;
}
export function exportThemeCSS(palette: Palette): string {
  return `/* lavette · Nuxt UI 4 / Tailwind CSS 4\n   Import this file AFTER tailwindcss and @nuxt/ui in your main CSS.\n   No app.config.ts color mapping needed: all seven --ui-color-* scales are supplied.\n   Copy the selected font files into public/fonts (keep their OFL licenses).\n   Pairing: ${fontPairing(palette.values.fontPairing).name}. Title classes: font-display font-normal leading-display tracking-normal.\n   Font faces below use /fonts/ URLs; adjust them for your deployment base.\n   Toggle the .dark class with Nuxt Color Mode; .light provides explicit light scopes.\n   Recipe ${palette.values.recipe} · Hue ${palette.values.hue} · Mood ${palette.values.mood}\n   Depth ${palette.values.depth} · Warmth ${palette.values.paperWarmth}\n   Seven OKLCH ramp seeds; shades are browser-native color-mix().\n   Status hues are fixed; status chroma stays expressive even with a quiet brand. */\n\n${fontFaces(palette.values.fontPairing)}\n\n@theme {\n${declarations({ ...fontTokens(palette.values.fontPairing), ...typographyTokens(palette.values.fontPairing) })}\n}\n\n${themeStyles(palette)}\n${focusStyles}`;
}
