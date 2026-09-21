# Nuxt UI compatibility fixture

Exercises exported CSS with real Nuxt UI components independently of the studio.
Install dependencies with `pnpm install` at the repository root, then run:

```sh
pnpm --filter lavette-nuxt-ui-compatibility build
pnpm --filter lavette-nuxt-ui-compatibility dev
```

Open http://127.0.0.1:5180 and check light/dark modes, button variants, and display
fonts. The theme script generates CSS and copies font assets before each run;
these outputs are ignored by Git.
