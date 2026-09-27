# Theme reference

How Lavette generates a theme. The generator is [`src/theme.ts`](../src/theme.ts);
the tests in [`tests/theme.test.ts`](../tests/theme.test.ts) sweep the full
settings range.

## Controls

Each control sets one thing, and each thing has one control.

**Color**

- **Primary hue** is primary's hue, used exactly.
- **Brand color** (optional) replaces Primary hue. It takes any CSS color,
  typed or picked, fitted to sRGB and stored as hex, and sets primary's hue and
  chroma. It lands exactly on the primary shade nearest its lightness that
  keeps the ramp in order. If it passes every role check it becomes the role
  color itself (700, or 300 for dark mode). A role color within 0.01 of it
  steps aside, darker or lighter, to make room. Near-grey colors (chroma below
  0.03) are rejected: Surface tint sets the greys.
- **Secondary color** sits beside primary (±40°) or opposite it (180° ±20°),
  whichever offset is farthest from the status hues. Its chroma follows
  primary's.
- **Vividness** runs from muted to vivid: the chroma of primary, secondary, and
  the status colors. With a brand color, it sets only the status colors.

**Surfaces**

- **Surface tint** picks the undertone of the neutral scale: the primary hue,
  warm paper (hue 80), or cool slate (hue 250). Dark mode keeps it.
- **Tint strength** scales it from neutral grey (0) to full (primary 0.011,
  warm 0.02, cool 0.014 chroma).
- **Dark mode background** runs from charcoal (L 0.235) to near black (L 0.15).

**Type and shape**

- **Font pairing** sets the display and body families (see Fonts).
- **Corner radius** sets `--ui-radius`; Nuxt UI derives its radius scale from it.
- **Focus ring offset** (Advanced) sets the gap between a focused control and
  its outline.

Shuffle picks a new primary hue, secondary color, vividness, and surface tint,
and clears any brand color. The other settings stay.

Saved themes from earlier versions migrate without changing how they look:
Color character becomes Vividness, Paper warmth becomes a surface tint and
strength, and the dark background keeps the depth character gave it.

## Output

The CSS contains only tokens, plus a native `:focus-visible` fallback:

- Seven OKLCH scales, `--ui-color-{role}-{50…950}`, fitted to sRGB. Yellows
  drift toward amber as they darken.
- `--ui-{role}` is shade 700 in light mode and 300 in dark mode. Nuxt UI uses
  that one color for text, solid fills, tints, and hover, so those two shades
  are the lightnesses nearest the middle at which all of them stay readable.
  The rest of the scale spaces out around them.
- Surface, text, and border tokens for both modes. Light mode is paper
  (L 0.975); dark mode is tinted charcoal (L 0.15–0.235, by depth).
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
