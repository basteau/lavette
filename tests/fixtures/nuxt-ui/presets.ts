// Fixed inputs keep browser comparisons reproducible across generator changes.
export const presets = {
  default: { harmony: "complementary", hue: 0, character: 50, paperWarmth: 50 },
  quiet: { harmony: "analogous", hue: 185, character: 0, paperWarmth: 100 },
  saturated: { harmony: "analogous", hue: 25, character: 100, paperWarmth: 0 },
  warm: { harmony: "complementary", hue: 270, character: 100, paperWarmth: 100 },
} as const;
