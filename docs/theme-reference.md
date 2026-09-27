# Theme reference

How Lavette generates a theme. The generator is [`src/theme.ts`](../src/theme.ts);
the tests in [`tests/theme.test.ts`](../tests/theme.test.ts) sweep the full
settings range.

## Controls

- **Hue** is primary's hue, used exactly.
- **Color relationship** puts secondary beside the hue (**Analogous**, ±40°) or
  opposite it (**Complementary**, 180° ±20°), whichever offset is farthest from
  the status hues.
- **Color character** runs from quiet to expressive: chroma, surface tint
  strength, and dark background depth.
- **Surface tone** fades a faint tint of the hue out by 50 (neutral grey), then
  fades paper in up to 100. **Paper** picks warm cream (hue 80) or cool slate
  (hue 250, a little less chroma). Dark mode keeps the undertone.

## Output

The CSS contains only tokens, plus a native `:focus-visible` fallback:

- Seven OKLCH scales, `--ui-color-{role}-{50…950}`, fitted to sRGB. Yellows
  drift toward amber as they darken.
- `--ui-{role}` is shade 700 in light mode and 300 in dark mode. Nuxt UI uses
  that one color for text, solid fills, tints, and hover, so those two shades
  are the lightnesses nearest the middle at which all of them stay readable.
  The rest of the scale spaces out around them.
- Surface, text, and border tokens for both modes. Light mode is paper
  (L 0.975); dark mode is tinted charcoal (L 0.18–0.215, by character).
- Fonts in `@theme`, and radius and focus offset in `:root`.

Status hues stay within recognizable ranges (success 130–165°, info 225–270°,
warning 60–88°, error 12–38°) and move away from a brand hue within 30°. A brand
hue on top of a status hue stays close to it.

## Contrast

Every pair is checked on all four surfaces in both modes:

| Pair | Minimum |
| --- | --- |
| Body, muted, and dimmed text | 4.5:1 |
| Role text, including on its 10% and 15% tints at 90% opacity | 4.5:1 |
| `text-inverted` on the role color, and on its 75% hover | 4.5:1 |
| Role color at 75% (link hover) | 4.5:1 |
| `border-accented` | 3:1 |
| `border` / `border-muted` (decorative) | 1.5:1 / 1.25:1 |

This covers color pairs, not a whole app.

## Fonts

Each pairing's faces use `size-adjust` so body text matches DM Sans's x-height
and display text matches Fraunces's cap height. The values are in
[`src/fonts.ts`](../src/fonts.ts). `src/google-fonts.json` pins the Google Fonts
faces; refresh it with `python3 scripts/refresh-google-fonts.py`, then recheck
the values with [`tests/fixtures/typography`](../tests/fixtures/typography/index.html).
