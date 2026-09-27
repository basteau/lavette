import { DEFAULT_FONT_PAIRING, fontPairing } from "./fonts";
import { generateTheme, type Theme } from "./theme";
export { exportCSS, format, inGamut } from "./theme";

export type Harmony = "analogous" | "complementary";
export type Paper = "warm" | "cool";
export interface PaletteValues {
  harmony: Harmony;
  hue: number;
  character: number;
  surfaceTone: number;
  paper: Paper;
  radius: number;
  focusOffset: number;
  fontPairing: string;
}
export interface Palette {
  values: PaletteValues;
  theme: Theme;
}

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));
const finite = (value: unknown, fallback: number): number => {
  if (value === null || value === "") return fallback;
  try {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
};
const wrap = (h: number): number => ((h % 360) + 360) % 360;

// Earlier versions showed the average of mood and depth as "Color character".
const legacyCharacter = ({ mood, depth }: Record<string, unknown>) =>
  mood === undefined ? undefined : (finite(mood, 50) + finite(depth ?? mood, 50)) / 2;

/** Accepts current and legacy saved settings (recipe/mood/depth, paperWarmth) and bounds every value. */
export function normalize(input: unknown = {}): PaletteValues {
  const values: Record<string, unknown> =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const harmony = values.harmony ?? (values.recipe === "soft" ? "complementary" : "analogous");
  return {
    harmony: harmony === "complementary" ? "complementary" : "analogous",
    hue: wrap(Math.round(wrap(finite(values.hue, 185)) * 1000) / 1000),
    character: Math.round(clamp(finite(values.character ?? legacyCharacter(values), 50), 0, 100)),
    surfaceTone: Math.round(clamp(finite(values.surfaceTone ?? values.paperWarmth, 30), 0, 100)),
    paper: values.paper === "cool" ? "cool" : "warm",
    radius: Math.round(clamp(finite(values.radius, 0.125), 0, 0.5) * 1000) / 1000,
    focusOffset: Math.round(clamp(finite(values.focusOffset, 0), 0, 4)),
    fontPairing: fontPairing(values.fontPairing).id,
  };
}

export function generatePalette(input: unknown): Palette {
  const values = normalize(input);
  return { values, theme: generateTheme(values) };
}

/** A new color direction; type, radius, and focus settings carry over from `base`. */
export function randomValues(base: Partial<PaletteValues> = {}): PaletteValues {
  return normalize({
    fontPairing: DEFAULT_FONT_PAIRING,
    ...base,
    harmony: Math.random() < 0.5 ? "analogous" : "complementary",
    hue: Math.floor(Math.random() * 360),
    character: Math.round(Math.random() * 100),
    surfaceTone: Math.round(Math.random() * 100),
    paper: Math.random() < 0.5 ? "warm" : "cool",
  });
}
