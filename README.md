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
or **Export theme** to download one ZIP with CSS, size configuration, fonts, licenses,
and installation instructions. Your current design is restored when you reload.

## Use your theme

Follow [Use an exported theme](docs/use-a-theme.md) to add the export to an
existing Nuxt UI app. The guide covers CSS import order, fonts, control sizes,
and dark mode.

See the [theme reference](docs/theme-reference.md) for palette controls, status
colors, contrast targets, and font sizing.

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

Lavette is [MIT licensed](LICENSE). Bundled fonts retain their SIL Open Font
Licenses in `public/fonts/`. The bundled UI skill retains its
[third-party license notices](.agents/skills/better-ui/LICENSE.txt).
