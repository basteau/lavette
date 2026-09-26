# Lavette

Lavette is a browser-based OKLCH theme studio for Nuxt UI 4 and Tailwind CSS 4.
Adjust colors and font pairings, preview real components in light and dark mode,
and export a theme for your app. Saved themes stay in your browser's local
storage. There is no backend.

The studio uses Vue and Vite. It does not require a Nuxt app to run.

Use the public studio at [lavette.exe.xyz](https://lavette.exe.xyz).
See [deployment instructions](DEPLOY.md) to publish an update.

## Run locally

Use Node.js 22.12 or later and the pnpm version pinned in `package.json`.
From the repository root, run:

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. Use **Save** to keep a theme in this browser
or **Export theme** to copy or download one CSS file with Google-hosted fonts. Your current design is restored when you reload.

## Use your theme

In an app with Nuxt UI 4 and Tailwind CSS 4, save the export as
`lavette-theme.css` and import it after both:

```css
@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";
```

Toggle `.dark` on `<html>` for dark mode (Nuxt Color Mode does this). Fonts load
from Google; with a Content Security Policy, allow `https://fonts.gstatic.com`
in `font-src`. For display headings, use
`font-display font-normal leading-display tracking-normal`.

The [theme reference](docs/theme-reference.md) explains how colors are generated
and checked.

## Check changes

Run the tests and production build from the repository root:

```sh
pnpm test
pnpm build
pnpm --filter lavette-nuxt-integration build
```

The build generates Nuxt UI types, checks TypeScript, and writes the static site
to `dist/`. To inspect that build locally, run:

```sh
pnpm preview
```

## License

Lavette is [MIT licensed](LICENSE). Fonts are served by Google Fonts under their
respective open-source licenses. The bundled UI skill retains its
[third-party license notices](.agents/skills/better-ui/LICENSE.txt).
