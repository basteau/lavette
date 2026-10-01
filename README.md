# Lavette

Lavette is a browser-based OKLCH theme studio for Nuxt UI 4 and Tailwind CSS 4.
Adjust colors, font pairings, and icon libraries, preview real components in light and dark mode,
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

### Icons

Choose Lucide, Tabler Outline, or Heroicons Outline in the studio. Under **Install**
or **Export theme → Install the selected icons**, download `lavette-ui.config.ts`
to your project root and install the matching collection:

```sh
pnpm add @iconify-json/lucide
# Or @iconify-json/tabler or @iconify-json/heroicons.
```

For Nuxt 4, merge these entries into the existing files:

```ts
// app/app.config.ts
import { uiTheme } from '../lavette-ui.config';
export default defineAppConfig({ ui: uiTheme });
```

```ts
// nuxt.config.ts
import { iconBundle } from './lavette-ui.config';
export default defineNuxtConfig({
  icon: { clientBundle: { icons: iconBundle } },
});
```

For Vue/Vite, use the exports in your existing Nuxt UI plugin registration:

```ts
import ui from '@nuxt/ui/vite';
import { uiTheme, iconBundle } from './lavette-ui.config';
ui({ ui: uiTheme, icon: { clientBundle: { icons: iconBundle } } });
```

Preserve unrelated configuration and component overrides. Append `iconBundle` to
any existing bundle list. These icons render locally, without remote requests.
Explicit icon names in your existing components remain unchanged. CSS alone
does not select an icon library. The generated map provides role completion
through `uiTheme.icons.search`; arbitrary icon strings remain ordinary strings.

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
