// Fixed inputs keep browser comparisons reproducible across generator changes.
export const presets = {
  default: { recipe: "soft", hue: 0, mood: 50, depth: 50, paperWarmth: 50 },
  quiet: { recipe: "tonal", hue: 185, mood: 0, depth: 0, paperWarmth: 100 },
  saturated: { recipe: "tonal", hue: 25, mood: 100, depth: 100, paperWarmth: 0 },
  warm: { recipe: "soft", hue: 270, mood: 100, depth: 100, paperWarmth: 100 },
} as const;
