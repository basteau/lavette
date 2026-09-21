import { DEFAULT_FONT_PAIRING, fontPairing } from "./fonts";
import { generateTheme, exportThemeCSS, type Theme } from "./theme";
import { converter, wcagContrast, type Oklch } from "culori";

export interface PaletteValues {
  recipe: "tonal" | "soft";
  hue: number;
  mood: number;
  depth: number;
  paperWarmth: number;
  radius: number;
  focusOffset: number;
  fontPairing: string;
}

export type PaletteRole = "canvas" | "ink" | "accent" | "support";
export interface PaletteCheck {
  label: string;
  ratio: number;
  target: number;
}

export interface Palette {
  theme: Theme;
  values: PaletteValues;
  colors: Record<PaletteRole, Oklch>;
  checks: PaletteCheck[];
  accentAdjusted: boolean;
  gamut: boolean;
}

// OKLCH is the source of truth. Linear sRGB is used only to check displayability.
const toLinear = converter("lrgb");
const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));
const finite = (value: unknown, fallback: number): number => {
  try {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
};
const wrap = (h: number): number => ((h % 360) + 360) % 360;
const floor6 = (n: number): number => Math.floor(n * 1e6) / 1e6;

export function normalize(input: unknown = {}): PaletteValues {
  const values: Record<string, unknown> =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  return {
    fontPairing: fontPairing(values.fontPairing).id,
    recipe: values.recipe === "tonal" ? "tonal" : "soft",
    hue: wrap(Math.round(wrap(finite(values.hue, 0)) * 1000) / 1000),
    mood: clamp(finite(values.mood, 50), 0, 100),
    depth: clamp(finite(values.depth, 50), 0, 100),
    paperWarmth: clamp(finite(values.paperWarmth, 50), 0, 100),
    focusOffset: Math.round(clamp(finite(values.focusOffset, 0), 0, 4)),
    radius: Math.round(clamp(finite(values.radius, 0.125), 0, 0.5) * 1000) / 1000,
  };
}

export function inGamut(color: Oklch): boolean {
  const rgb = toLinear(color);
  return [rgb.r, rgb.g, rgb.b].every(
    (v) => Number.isFinite(v) && v >= 0 && v <= 1,
  );
}

function maxChroma(l: number, h: number): number {
  let low = 0;
  let high = 0.4;
  for (let i = 0; i < 24; i++) {
    const c = (low + high) / 2;
    if (inGamut({ mode: "oklch", l, c, h })) low = c;
    else high = c;
  }
  return low;
}

function color(l: number, c: number, h: number): Oklch {
  l = floor6(clamp(l, 0.05, 0.99));
  h = Math.round(wrap(h) * 1000) / 1000;
  // Leave a small gamut margin; measurements use the same rounded values as CSS.
  c = floor6(Math.min(c, maxChroma(l, h) * 0.998));
  return { mode: "oklch", l, c, h };
}

function relativeColor(
  l: number,
  h: number,
  fraction: number,
  cap: number,
): Oklch {
  return color(l, Math.min(maxChroma(l, wrap(h)) * fraction, cap), h);
}

// Keep the requested hue; lower lightness only when an actual role pair needs it.
function protectDark(
  makeColor: (lightness: number) => Oklch,
  requestedL: number,
  backgrounds: readonly Oklch[],
  target: number,
): Oklch {
  const passes = (candidate: Oklch): boolean =>
    backgrounds.every((bg) => wcagContrast(candidate, bg) >= target);
  const requested = makeColor(requestedL);
  if (passes(requested)) return requested;
  let low = 0.16;
  let high = requestedL;
  for (let i = 0; i < 22; i++) {
    const mid = (low + high) / 2;
    if (passes(makeColor(mid))) low = mid;
    else high = mid;
  }
  return makeColor(low);
}

export function format(color: Oklch): string {
  return `oklch(${color.l} ${color.c} ${color.h})`;
}

export function generatePalette(input: unknown): Palette {
  const values = normalize(input);
  const { recipe, hue: h } = values;
  const mood = values.mood / 100;
  const depth = values.depth / 100;
  const warmth = values.paperWarmth / 100;
  const canvas = color(0.974 - depth * 0.006, 0.002 + warmth * 0.018, 85);
  let ink: Oklch;
  let accent: Oklch;
  let support: Oklch;
  let accentAdjusted = false;

  if (recipe === "tonal") {
    support = relativeColor(0.94 - mood * 0.065, h, 0.25 + mood * 0.3, 0.07);
    ink = protectDark(
      (l) => relativeColor(l, h, 0.2 + mood * 0.12, 0.04),
      0.31 - depth * 0.1,
      [canvas, support],
      7.1,
    );
    const wantedL = 0.59 - depth * 0.12;
    accent = protectDark(
      (l) => relativeColor(l, h, 0.48 + mood * 0.38, 0.24),
      wantedL,
      [canvas],
      4.65,
    );
    accentAdjusted = wantedL - accent.l > 0.001;
  } else {
    accent = relativeColor(
      0.9 - depth * 0.035,
      h + 215,
      0.3 + mood * 0.28,
      0.08,
    );
    support = relativeColor(
      0.9 - depth * 0.055,
      h - 50,
      0.5 + mood * 0.3,
      0.14,
    );
    ink = protectDark(
      (l) => relativeColor(l, h, 0.54 + mood * 0.22, 0.08),
      0.35 - depth * 0.09,
      [canvas, accent, support],
      7.1,
    );
  }

  const colors: Palette["colors"] = { canvas, ink, accent, support };
  const onAccent =
    wcagContrast(ink, accent) >= wcagContrast(canvas, accent)
      ? "ink"
      : "canvas";
  const action = recipe === "tonal" ? "accent" : "ink";
  const checks: PaletteCheck[] = [
    { label: "Text / background", ratio: wcagContrast(ink, canvas), target: 7 },
    { label: "Text / secondary surface", ratio: wcagContrast(ink, support), target: 7 },
    {
      label: "Button / label",
      ratio: wcagContrast(colors[action], canvas),
      target: 4.5,
    },
    {
      label: "Primary surface / label",
      ratio: wcagContrast(accent, colors[onAccent]),
      target: 4.5,
    },
  ];
  return {
    theme: generateTheme(values, colors),
    values,
    colors,
    checks,
    accentAdjusted,
    gamut: Object.values(colors).every(inGamut),
  };
}

export function exportCSS(palette: Palette): string {
  return exportThemeCSS(palette);
}

export function randomValues(): PaletteValues {
  return {
    recipe: Math.random() < 0.5 ? "tonal" : "soft",
    hue: Math.floor(Math.random() * 360),
    mood: Math.round(Math.random() * 100),
    depth: Math.round(Math.random() * 100),
    paperWarmth: Math.round(Math.random() * 100),
    radius: 0.125,
    focusOffset: 0,
    fontPairing: DEFAULT_FONT_PAIRING,
  };
}
