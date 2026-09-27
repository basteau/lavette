import { clampChroma, converter, formatHex, parse } from "culori";
import { DEFAULT_FONT_PAIRING, fontPairing } from "./fonts";
import { DARK_L, SURFACE_TINTS, clamp, generateTheme, wrap, type Theme } from "./theme";

export type Harmony = "analogous" | "complementary";
export type SurfaceTint = "primary" | "warm" | "cool";
export interface PaletteValues {
  harmony: Harmony;
  hue: number;
  vividness: number;
  surfaceTint: SurfaceTint;
  tintStrength: number;
  darkDepth: number;
  /** An exact primary color as #rrggbb, or "" to derive primary from hue and vividness. */
  brandColor: string;
  radius: number;
  focusOffset: number;
  fontPairing: string;
}
export interface Palette {
  values: PaletteValues;
  theme: Theme;
}

const finite = (value: unknown, fallback: number): number => {
  if (value === null || value === "") return fallback;
  try {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
};
const oklch = converter("oklch");

/** Below this chroma a color reads as grey; greys come from the neutral scale instead. */
export const MIN_BRAND_CHROMA = 0.03;
/** Reads any CSS color, fitted to sRGB, as #rrggbb. Empty input clears the brand color. */
export function parseBrandColor(input: unknown): { hex: string } | { error: string } {
  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return { hex: "" };
  const color = parse(text) ?? parse(`#${text}`);
  if (!color) return { error: "Enter a color like #1f4fd8, rgb(31 79 216), or oklch(0.5 0.2 265)." };
  if ((color.alpha ?? 1) < 1) return { error: "Use an opaque color; brand colors can't be transparent." };
  const hex = formatHex(clampChroma(color, "oklch"));
  if ((oklch(hex)?.c ?? 0) < MIN_BRAND_CHROMA) return { error: "This color is nearly grey. Surface tint sets the greys; choose a more colorful brand color." };
  return { hex };
}

// Earlier versions showed the average of mood and depth as "Color character", now vividness.
const legacyCharacter = ({ mood, depth }: Record<string, unknown>) =>
  mood === undefined ? undefined : (finite(mood, 50) + finite(depth ?? mood, 50)) / 2;

// Dark mode depth used to follow vividness: background L 0.215 (muted) to 0.18 (vivid).
const legacyDarkDepth = (vividness: number) =>
  (DARK_L.soft - (0.215 - 0.035 * vividness / 100)) / (DARK_L.soft - DARK_L.deep) * 100;

// Paper warmth was one slider: a primary tint (scaled by vividness) faded out by 50, then warm
// paper faded in.
function legacyTint(warmth: number, vividness: number): { surfaceTint: SurfaceTint; tintStrength: number } {
  const w = warmth / 100;
  if (w >= 0.5) return { surfaceTint: "warm", tintStrength: (2 * w - 1) * 100 };
  return { surfaceTint: "primary", tintStrength: (1 - 2 * w) * (0.005 + 0.006 * vividness / 100) / SURFACE_TINTS.primary.chroma * 100 };
}

/** Accepts current and legacy saved settings (recipe/mood/depth, character, paperWarmth) and bounds every value. */
export function normalize(input: unknown = {}): PaletteValues {
  const values: Record<string, unknown> =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const harmony = values.harmony ?? (values.recipe === "soft" ? "complementary" : "analogous");
  const parsed = parseBrandColor(values.brandColor);
  const brand = "hex" in parsed ? parsed.hex : "";
  const vividness = Math.round(clamp(finite(values.vividness ?? values.character ?? legacyCharacter(values), 50), 0, 100));
  const legacy = values.paperWarmth === undefined ? undefined : legacyTint(clamp(finite(values.paperWarmth, 30), 0, 100), vividness);
  const tint = values.surfaceTint ?? legacy?.surfaceTint;
  return {
    harmony: harmony === "complementary" ? "complementary" : "analogous",
    hue: Math.round(wrap(brand ? oklch(brand)!.h! : finite(values.hue, 185)) * 1000) / 1000 % 360,
    vividness,
    surfaceTint: tint === "warm" || tint === "cool" ? tint : "primary",
    tintStrength: Math.round(clamp(finite(values.tintStrength ?? legacy?.tintStrength, 30), 0, 100)),
    darkDepth: Math.round(clamp(finite(values.darkDepth, legacyDarkDepth(vividness)), 0, 100)),
    brandColor: brand,
    radius: Math.round(clamp(finite(values.radius, 0.125), 0, 0.5) * 1000) / 1000,
    focusOffset: Math.round(clamp(finite(values.focusOffset, 0), 0, 4)),
    fontPairing: fontPairing(values.fontPairing).id,
  };
}

export function generatePalette(input: unknown): Palette {
  const values = normalize(input);
  return { values, theme: generateTheme(values) };
}

/** A new color direction, which drops any brand color; type, radius, focus, and dark depth
 * settings carry over from `base`. */
export function randomValues(base: Partial<PaletteValues> = {}): PaletteValues {
  return normalize({
    fontPairing: DEFAULT_FONT_PAIRING,
    ...base,
    brandColor: "",
    harmony: Math.random() < 0.5 ? "analogous" : "complementary",
    hue: Math.floor(Math.random() * 360),
    vividness: Math.round(Math.random() * 100),
    surfaceTint: (["primary", "warm", "cool"] as const)[Math.floor(Math.random() * 3)],
    tintStrength: Math.round(Math.random() * 100),
  });
}
