# Nuxt integration smoke test

This fixture builds a real Nuxt 4 application from the CSS exporter. It uses
Google-hosted fonts and no studio styles or preview overrides. Generated files
are ignored by Git.

From the repository root:

```sh
pnpm install
pnpm --filter lavette-nuxt-integration build
pnpm --filter lavette-nuxt-integration dev
```

Open the printed localhost URL. Verify display/body fonts, Nuxt UI’s default
button and input sizes, light/dark switching, and the portalled dialog.
For the production server, run `node .output/server/index.mjs` inside this fixture.

The existing `nuxt-ui` fixture covers more component variants and palette extremes.
