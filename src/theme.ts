import { fontFaces, fontTokens, fontPairing, typographyTokens } from "./fonts";
import { converter, wcagContrast, type Color, type Oklch } from "culori";
import type { Palette, PaletteValues } from "./palette";

export const THEME_ROLES = ["primary", "secondary", "success", "info", "warning", "error", "neutral"] as const;
export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
type ThemeRole = typeof THEME_ROLES[number];
type AccentRole = Exclude<ThemeRole, "neutral">;
export type StatusRole = keyof typeof STATUS;
type Shade = typeof SHADES[number];
type ColorMode = "light" | "dark";
type Tokens = Record<`--${string}`, string>;
interface ContrastCheck {
  label: string;
  ratio: number;
  target: number;
}
export interface Theme {
  hues: Record<ThemeRole, number>;
  scales: Record<ThemeRole, Record<Shade, Oklch>>;
  surfaces: Record<ColorMode, Oklch[]>;
  /** The single --ui-<role> color per mode, as Nuxt UI uses it for text, fills, and tints. */
  roles: Record<ColorMode, Record<AccentRole, Oklch>>;
  /** The primary shade that is exactly the brand color, or null without one (or when it can't fit). */
  brandShade: Shade | null;
  tokens: Tokens;
  modes: Record<ColorMode, Tokens>;
  checks: Record<ColorMode, ContrastCheck[]>;
}

export const ACCENT_ROLES = THEME_ROLES.filter((role): role is AccentRole => role !== "neutral");
/** Status meaning stays recognizable: each hue may move within its range to clear brand hues. */
export const STATUS = {
  success: { hue: 150, range: [130, 165] },
  info: { hue: 250, range: [225, 270] },
  warning: { hue: 75, range: [60, 88] },
  error: { hue: 25, range: [12, 38] },
} as const;

const TEXT = 4.5;
const GRAPHIC = 3;
// Nuxt UI renders a role color at these opacities: tints behind text, 75% for hover,
// and alert descriptions at 90%.
const TINTS = [0, 0.1, 0.15];
const HOVER = 0.75;
const DESCRIPTION = 0.9;
/** Surface tints at full strength: the primary hue, warm paper, or cool slate. */
export const SURFACE_TINTS = { primary: { chroma: 0.011 }, warm: { hue: 80, chroma: 0.02 }, cool: { hue: 250, chroma: 0.014 } } as const;
const CANVAS_L = 0.975;
/** Dark mode background lightness, from soft charcoal to near black. */
export const DARK_L = { soft: 0.235, deep: 0.15 } as const;
// Full vividness from 300 to 700, falling off toward both ends.
const CHROMA = { 50: 0.12, 100: 0.25, 200: 0.5, 300: 1, 400: 1, 500: 1, 600: 1, 700: 1, 800: 0.8, 900: 0.62, 950: 0.48 } as const;

const lrgb = converter("lrgb");
const oklch = converter("oklch");
const rgb = converter("rgb");
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round = (n: number) => Math.round(n * 1e6) / 1e6;
const wrap = (h: number) => ((h % 360) + 360) % 360;
export const hueDistance = (a: number, b: number) => {
  const d = wrap(a - b);
  return Math.min(d, 360 - d);
};
export const format = (c: Oklch) => `oklch(${c.l} ${c.c} ${c.h ?? 0})`;

export function inGamut(color: Oklch): boolean {
  const v = lrgb(color);
  return [v.r, v.g, v.b].every(n => Number.isFinite(n) && n >= -1e-7 && n <= 1 + 1e-7);
}
function maxChroma(l: number, h: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const c = (lo + hi) / 2;
    if (inGamut({ mode: "oklch", l, c, h })) lo = c;
    else hi = c;
  }
  return lo;
}
/** The requested color, with chroma reduced only as far as sRGB requires. */
function fit(l: number, c: number, h: number): Oklch {
  l = round(clamp(l, 0, 1));
  h = round(wrap(h));
  return { mode: "oklch", l, c: Math.floor(Math.min(c, maxChroma(l, h) * 0.998) * 1e6) / 1e6, h };
}
/** A color as given, to six decimals, with chroma stepped down only if rounding left sRGB. */
export function exact(color: Oklch): Oklch {
  let c: Oklch = { mode: "oklch", l: round(color.l), c: Math.floor((color.c ?? 0) * 1e6) / 1e6, h: round(wrap(color.h ?? 0)) };
  while (!inGamut(c) && c.c > 0) c = { ...c, c: round(c.c - 1e-6) };
  return c;
}
/** Put the brand color on the primary shade nearest its lightness where the ramp stays in order.
 * Mutates `scale`; returns the shade, or null if no shade can take it. */
function placeBrand(scale: Record<Shade, Oklch>, brand: Oklch): Shade | null {
  if (scale[300] === brand) return 300;
  if (scale[700] === brand) return 700;
  const GAP = 0.005;
  const fits = SHADES.filter((shade, i) => {
    if (shade === 300 || shade === 700) return false;
    const lighter = i ? scale[SHADES[i - 1]].l : 1, darker = i < SHADES.length - 1 ? scale[SHADES[i + 1]].l : 0;
    return brand.l < lighter - GAP && brand.l > darker + GAP;
  });
  if (!fits.length) return null;
  const best = fits.reduce((a, b) => Math.abs(scale[b].l - brand.l) < Math.abs(scale[a].l - brand.l) ? b : a);
  scale[best] = brand;
  return best;
}
/** Yellows turn olive as they darken; drift them toward amber instead. */
function hueAt(h: number, l: number): number {
  const weight = Math.max(0, 1 - hueDistance(h, 90) / 40);
  return wrap(h + weight * 40 * (l - 0.64));
}
const ramp = (h: number, c: number) => (l: number) => fit(l, c, hueAt(h, l));

/** The color closest to `start` that passes, moving toward `end`. Every check here only gains
 * contrast in that direction, so bisection finds the boundary. Returns `end` if nothing passes. */
function search(make: (l: number) => Oklch, start: number, end: number, passes: (c: Oklch) => boolean): Oklch {
  if (passes(make(start))) return make(start);
  let fail = start, pass = end;
  for (let i = 0; i < 16; i++) {
    const mid = (fail + pass) / 2;
    if (passes(make(mid))) pass = mid;
    else fail = mid;
  }
  return make(pass);
}

// CSS source-over alpha compositing occurs in sRGB, not OKLCH.
export function composite(fg: Color, bg: Color, opacity: number) {
  const f = rgb(fg), b = rgb(bg);
  return { mode: "rgb" as const, r: f.r * opacity + b.r * (1 - opacity), g: f.g * opacity + b.g * (1 - opacity), b: f.b * opacity + b.b * (1 - opacity) };
}
const minContrast = (color: Oklch, surfaces: Oklch[]) => Math.min(...surfaces.map(s => wcagContrast(color, s)));
/** Role color as text: on each surface and on its own tints, including faded descriptions. */
const textContrast = (color: Oklch, surfaces: Oklch[]) => Math.min(...surfaces.flatMap(s => TINTS.map(alpha => {
  const bg = composite(color, s, alpha);
  return wcagContrast(composite(color, bg, DESCRIPTION), bg);
})));
/** Role color as a fill: its label, a faded label, and the label on the 75% hover over each surface. */
const fillContrast = (color: Oklch, label: Oklch, surfaces: Oklch[]) => Math.min(
  wcagContrast(composite(label, color, DESCRIPTION), color),
  ...surfaces.map(s => wcagContrast(label, composite(color, s, HOVER))),
);
/** Role color as a link on hover: 75% over each surface. */
const hoverContrast = (color: Oklch, surfaces: Oklch[]) => Math.min(...surfaces.map(s => wcagContrast(composite(color, s, HOVER), s)));

/** Keep the preferred hue unless a brand hue is within 30°; then move only as far as the range allows. */
function clearHue(preferred: number, [lo, hi]: readonly [number, number], avoid: number[]): number {
  let best = preferred, bestScore = -Infinity;
  for (let h = lo; h <= hi; h++) {
    const clearance = Math.min(...avoid.map(a => hueDistance(h, a)));
    const score = Math.min(clearance, 30) * 10 - Math.abs(h - preferred);
    if (score > bestScore) [best, bestScore] = [h, score];
  }
  return wrap(best);
}

/** Ramp lightness for every accent role: 700 is the light-mode role color and 300 the
 * dark-mode one; the other shades space out around them. */
function rampLightness(l300: number, l700: number): Record<Shade, number> {
  const l500 = (l300 + l700) / 2;
  const toDark = (f: number) => l700 - (l700 - 0.2) * f;
  return {
    50: 0.97, 100: 0.94, 200: (0.94 + l300) / 2, 300: l300, 400: (l300 + l500) / 2, 500: l500,
    600: (l500 + l700) / 2, 700: l700, 800: toDark(0.3), 900: toDark(0.6), 950: toDark(0.85),
  };
}

export function generateTheme(values: PaletteValues): Theme {
  const vividness = values.vividness / 100;

  // Hues: primary is exactly the chosen hue. Secondary takes the harmony offset that
  // stays clearest of status hues; status hues then step aside from both brand hues.
  const primaryHue = values.hue;
  const statusClearance = (h: number) => Math.min(25, ...Object.values(STATUS).map(s => hueDistance(h, s.hue)));
  const offsets = values.harmony === "complementary" ? [180, 160, 200] : [40, -40];
  const secondaryHue = offsets
    .map(offset => wrap(primaryHue + offset))
    .reduce((best, h) => statusClearance(h) > statusClearance(best) ? h : best);
  const hues = { primary: primaryHue, secondary: secondaryHue } as Record<ThemeRole, number>;
  for (const [role, { hue, range }] of Object.entries(STATUS)) hues[role as StatusRole] = clearHue(hue, range, [primaryHue, secondaryHue]);

  // Surfaces: one faint tint, from the primary hue or from warm or cool paper, at the chosen
  // strength; 0 is neutral grey. Dark mode keeps the same undertone.
  const tint = SURFACE_TINTS[values.surfaceTint];
  const neutralChroma = tint.chroma * values.tintStrength / 100;
  hues.neutral = "hue" in tint ? tint.hue : primaryHue;
  const surface = (l: number) => fit(l, neutralChroma, hues.neutral);
  const darkL = DARK_L.soft - (DARK_L.soft - DARK_L.deep) * values.darkDepth / 100;
  const canvas = surface(CANVAS_L);
  const night = surface(darkL);
  const surfaces: Theme["surfaces"] = {
    light: [canvas, surface(CANVAS_L - 0.015), surface(CANVAS_L - 0.04), surface(CANVAS_L - 0.075)],
    dark: [night, surface(darkL + 0.025), surface(darkL + 0.05), surface(darkL + 0.09)],
  };
  const neutralL: Record<Shade, number> = {
    50: CANVAS_L - 0.015, 100: CANVAS_L - 0.04, 200: CANVAS_L - 0.075, 300: 0.83, 400: 0.71,
    500: 0.57, 600: 0.47, 700: 0.39, 800: darkL + 0.12, 900: darkL + 0.05, 950: darkL,
  };

  // Accent roles. Nuxt UI uses one color per role for text, fills, tints, and hover,
  // so each mode gets the lightness nearest the middle that keeps all of those readable.
  // A brand color sets primary's chroma, and secondary follows primary, never dropping to neutral.
  const brand = values.brandColor ? exact(oklch(values.brandColor)!) : undefined;
  const primaryChroma = brand?.c ?? 0.07 + 0.13 * vividness;
  const chroma: Record<AccentRole, number> = {
    primary: primaryChroma,
    secondary: Math.max(primaryChroma, 0.07) * (values.harmony === "complementary" ? 0.6 : 0.7),
    success: 0.14 + 0.06 * vividness,
    info: 0.14 + 0.06 * vividness,
    warning: 0.14 + 0.06 * vividness,
    error: 0.16 + 0.06 * vividness,
  };
  const passes = (mode: ColorMode) => (c: Oklch) => {
    const label = mode === "light" ? canvas : night;
    return textContrast(c, surfaces[mode]) >= TEXT
      && fillContrast(c, label, surfaces[mode]) >= TEXT && hoverContrast(c, surfaces[mode]) >= TEXT;
  };
  const scales = {} as Theme["scales"];
  const roles: Theme["roles"] = { light: {} as Record<AccentRole, Oklch>, dark: {} as Record<AccentRole, Oklch> };
  for (const role of ACCENT_ROLES) {
    const make = ramp(hues[role], chroma[role]);
    roles.light[role] = search(make, 0.62, 0.15, passes("light"));
    roles.dark[role] = search(make, 0.55, 0.9, passes("dark"));
    // A readable brand color becomes the role color itself, within lightnesses that leave
    // room for the rest of the ramp.
    // Otherwise a role color within 0.01 of it steps away, in the direction that only gains
    // contrast, so the brand color can sit beside it.
    if (role === "primary" && brand) {
      if (brand.l >= 0.33 && passes("light")(brand)) roles.light.primary = brand;
      else if (brand.l <= 0.82 && passes("dark")(brand)) roles.dark.primary = brand;
      else if (Math.abs(brand.l - roles.light.primary.l) < 0.01) roles.light.primary = make(brand.l - 0.01);
      else if (Math.abs(brand.l - roles.dark.primary.l) < 0.01) roles.dark.primary = make(brand.l + 0.01);
    }
    const l = rampLightness(roles.dark[role].l, roles.light[role].l);
    scales[role] = Object.fromEntries(SHADES.map(shade => [shade,
      shade === 300 ? roles.dark[role] : shade === 700 ? roles.light[role]
        : fit(l[shade], chroma[role] * CHROMA[shade], hueAt(hues[role], l[shade]))])) as Record<Shade, Oklch>;
  }
  const brandShade = brand ? placeBrand(scales.primary, brand) : null;
  scales.neutral = Object.fromEntries(SHADES.map(shade => [shade, surface(neutralL[shade])])) as Record<Shade, Oklch>;

  const tokens: Tokens = {
    "--ui-focus-offset": `${values.focusOffset}px`,
    "--ui-radius": `${values.radius}rem`,
  };
  for (const role of THEME_ROLES) for (const shade of SHADES) tokens[`--ui-color-${role}-${shade}`] = format(scales[role][shade]);

  const n = scales.neutral;
  const alias = (shade: Shade) => `var(--ui-color-neutral-${shade})`;
  const modes = {} as Theme["modes"];
  const checks = {} as Theme["checks"];
  for (const mode of ["light", "dark"] as const) {
    const dark = mode === "dark";
    const [bg, muted, elevated, accented] = surfaces[mode];
    const inverted = dark ? canvas : night;
    // Borders are the faintest color meeting each target on every surface.
    const border = (target: number) => search(surface, dark ? darkL + 0.09 : CANVAS_L - 0.075, dark ? 0.9 : 0.1,
      color => minContrast(color, surfaces[mode]) >= target);
    const borders = { muted: border(1.25), standard: border(1.5), accented: border(GRAPHIC) };
    const text = dark
      ? { dimmed: 400, muted: 300, toned: 200, text: 100 } as const
      : { dimmed: 600, muted: 700, toned: 800, text: 900 } as const;
    const m: Tokens = {
      "--ui-bg": format(bg),
      "--ui-bg-muted": format(muted),
      "--ui-bg-elevated": format(elevated),
      "--ui-bg-accented": format(accented),
      "--ui-bg-inverted": format(inverted),
      "--ui-text-dimmed": alias(text.dimmed),
      "--ui-text-muted": alias(text.muted),
      "--ui-text-toned": alias(text.toned),
      "--ui-text": alias(text.text),
      "--ui-text-highlighted": dark ? format(canvas) : alias(950),
      "--ui-text-inverted": format(dark ? night : canvas),
      "--ui-border": format(borders.standard),
      "--ui-border-muted": format(borders.muted),
      "--ui-border-accented": format(borders.accented),
      "--ui-border-inverted": format(inverted),
    };
    const list: ContrastCheck[] = [];
    const add = (label: string, ratio: number, target = TEXT) => list.push({ label, ratio, target });
    add("Body text", minContrast(n[text.text], surfaces[mode]));
    add("Muted text", minContrast(n[text.muted], surfaces[mode]));
    add("Dimmed text", minContrast(n[text.dimmed], surfaces[mode]));
    add("Inverted label", wcagContrast(dark ? night : canvas, inverted));
    add("Control border", minContrast(borders.accented, surfaces[mode]), GRAPHIC);
    add("Border", minContrast(borders.standard, surfaces[mode]), 1.5);
    add("Muted border", minContrast(borders.muted, surfaces[mode]), 1.25);
    for (const role of ACCENT_ROLES) {
      const color = roles[mode][role];
      const name = role[0].toUpperCase() + role.slice(1);
      m[`--ui-${role}`] = `var(--ui-color-${role}-${dark ? 300 : 700})`;
      add(`${name} text`, textContrast(color, surfaces[mode]));
      add(`${name} button label`, fillContrast(color, dark ? night : canvas, surfaces[mode]));
      add(`${name} link hover`, hoverContrast(color, surfaces[mode]));
    }
    modes[mode] = m;
    checks[mode] = list;
  }
  return { hues, scales, surfaces, roles, brandShade, tokens, modes, checks };
}

/** Swatches of the colors the preview is using in the given mode. */
export function corePaletteColors(palette: Palette, mode: ColorMode) {
  const { surfaces, scales, roles } = palette.theme;
  return [
    { label: "Background", token: "--ui-bg", color: surfaces[mode][0] },
    { label: "Text", token: "--ui-text", color: scales.neutral[mode === "dark" ? 100 : 900] },
    { label: "Primary", token: "--ui-primary", color: roles[mode].primary },
    { label: "Secondary", token: "--ui-secondary", color: roles[mode].secondary },
  ];
}

function declarations(tokens: Tokens): string {
  return Object.entries(tokens).map(([key, value]) => `  ${key}: ${value};`).join("\n");
}
export const focusStyles = `/* Native controls get a clear fallback; Nuxt UI keeps its variant-specific halos. */
@layer base {
  :focus-visible { outline: 2px solid var(--ui-primary); }
}
:focus-visible { outline-offset: var(--ui-focus-offset, 0px); }
`;
/** Theme tokens for both modes. Fonts are declared separately: `@theme` in the export, `:root` in the studio. */
export function themeStyles(palette: Palette): string {
  const { tokens, modes } = palette.theme;
  return `:root {\n${declarations(tokens)}\n}\n\n:root, .light {\n  color-scheme: light;\n${declarations(modes.light)}\n}\n\n.dark {\n  color-scheme: dark;\n${declarations(modes.dark)}\n}\n`;
}
export function fontStyles(id: string): string {
  return `:root {\n${declarations({ ...fontTokens(id), ...typographyTokens(id) })}\n}\n`;
}
export function exportCSS(palette: Palette): string {
  const v = palette.values;
  return `/* lavette · Nuxt UI 4 / Tailwind CSS 4
   Import after tailwindcss and @nuxt/ui. Toggle .dark for dark mode.
   Fonts load from Google; allow https://fonts.gstatic.com in font-src if you use a CSP.
   Display headings: font-display font-normal leading-display tracking-normal.
   ${fontPairing(v.fontPairing).name} · ${v.harmony} · hue ${v.hue} · vividness ${v.vividness} · ${v.surfaceTint} tint ${v.tintStrength} · dark depth ${v.darkDepth}${v.brandColor ? ` · brand ${v.brandColor}` : ""} */

${fontFaces(v.fontPairing)}

@theme {
${declarations({ ...fontTokens(v.fontPairing), ...typographyTokens(v.fontPairing) })}
}

${themeStyles(palette)}
${focusStyles}`;
}
