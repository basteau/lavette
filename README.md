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

## Compatibility checks

```sh
pnpm --filter lavette-nuxt-ui-compatibility build
pnpm --filter lavette-nuxt-ui-compatibility dev
```

The fixture checks exported CSS against real Nuxt UI components. With the main
dev server running, `/tests/fixtures/typography/` provides a font comparison.
