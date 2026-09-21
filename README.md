# Lavette

A browser-based OKLCH theme studio for Nuxt UI 4 and Tailwind CSS 4, built with
Vue and Vite. Explore colors, font pairings, and live components; save themes
locally and export their CSS. No backend.

## Development

Use Node.js 22.12+ and pnpm (the version is pinned in `package.json`).

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

The build includes type checking and produces `dist/` for static hosting.

## Use a theme

Export the CSS and selected fonts from the studio. Copy the fonts and their OFL
licenses into your app's `public/fonts/`, then import the theme:

```css
@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";
```

Toggle `.dark` on the root element for dark mode. Adjust the exported `/fonts/`
URLs if your app uses a different asset base.

The export includes semantic utility treatments as well as tokens. Keep the
complete stylesheet: success, info, warning, and error use separate text, fill,
hover, tint, and indicator colors. Their 600–950 shades are individually fitted
to sRGB; primary, secondary, and neutral retain the original mixed ramps.

`--ui-success` (and the other status aliases) is the text/fallback color.
`--ui-success-fill`, `--ui-success-on-fill`, `--ui-success-hover`,
`--ui-success-tint`, and `--ui-success-indicator` describe the other uses.
Nuxt UI's `bg-success text-inverted` combination receives the labelled fill;
plain `bg-success` receives the indicator color. The same applies to the other
statuses. In light mode, warning uses bright amber with a dark label (at least
7:1 in normal and hover states), and darker gold for small indicators.

The included unlayered CSS adapts Nuxt UI 4's solid, soft/subtle, and link
utility classes, including enabled hover/active states and semantic focus
outlines. It requires no component configuration. Custom components should use
the corresponding tokens and verify their actual foreground/background pairs;
unlisted opacity or state utilities retain Tailwind's normal behavior.

Light-mode muted and standard borders have visibility floors of 1.5:1 and
1.9:1 against the four ordinary generated surfaces. These are decorative
separator targets, not control-boundary accessibility claims. Use
`border-accented` for a control-identifying boundary (checked at 3:1).

## Font sizing

All pairings share the same CSS font-size scale and component spacing. A single
`size-adjust` value per family in `src/fonts.ts` normalizes the bundled font faces:
body families match DM Sans's x-height and display families match Fraunces's cap
height. This lifts Alegreya Sans by 16.4% and Alegreya by 9.9%, without special
component rules. The adjustment applies to every supplied weight and italic,
and is included in exported `@font-face` declarations. Geist Mono stays unchanged.
The typography fixture compares original and normalized faces at identical CSS
sizes, including controls and small text.

## Palette controls and default size

Color character links the existing mood and depth parameters: quiet colors are
lighter and restrained; expressive colors are deeper and more intense. Paper
warmth changes the canvas/neutral tint independently. Gamut and contrast checks
remain automatic. Old saved themes retain their exact independent mood/depth
values until the character slider is moved; its initial position is their average.

Small, Medium, and Large use Nuxt UI's native default size variants for supported
controls. Padding, icons, and control text follow the library's size definitions;
body/display typography and explicitly sized specimens stay stable. The font-face
normalization above applies in every size.

Size is configuration, not a CSS token. In the export dialog, choose Nuxt or
Vue/Vite and copy/download the companion configuration as well as the CSS. Merge
it into `app.config.ts` (Nuxt) or the `ui` option of `@nuxt/ui/vite`. This follows
[Nuxt UI's official theme editor](https://github.com/nuxt/ui/blob/v4/docs/app/utils/theme/engine/serialize.ts).

## Compatibility checks

```sh
pnpm --filter lavette-nuxt-ui-compatibility build
pnpm --filter lavette-nuxt-ui-compatibility dev
```

The fixture checks exported CSS against real Nuxt UI components. With the main
dev server running, `/tests/fixtures/typography/` provides a font comparison.
