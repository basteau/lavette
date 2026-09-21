# Lavette

Lavette is a browser-based OKLCH theme studio for Nuxt UI 4 and Tailwind CSS 4.
Adjust colors and font pairings, preview real components in light and dark mode,
and export a theme for your app. Saved themes stay in your browser's local
storage. There is no backend.

The studio uses Vue and Vite. It does not require a Nuxt app to run.

## Run locally

Use Node.js 22.12 or later and the pnpm version pinned in `package.json`.
From the repository root, run:

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. Use **Save** to keep a theme in this browser
or **Export theme** to download its CSS, size configuration, and font files.

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
```

The build generates Nuxt UI types, checks TypeScript, and writes the static site
to `dist/`. To inspect that build locally, run:

```sh
pnpm preview
```

## License

Lavette is [MIT licensed](LICENSE). Bundled fonts retain their SIL Open Font
Licenses in `public/fonts/`. Third-party skill attribution and license notices
are preserved in [.agents/skills/SOURCES.md](.agents/skills/SOURCES.md) and its
linked notices. Those materials retain their respective licenses.
