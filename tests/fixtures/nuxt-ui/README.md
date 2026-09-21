# Nuxt UI compatibility fixture

Exercises the complete exported CSS with real Nuxt UI components independently
of the studio. Install dependencies with `pnpm install` at the repository root:

```sh
pnpm --filter lavette-nuxt-ui-compatibility build
pnpm --filter lavette-nuxt-ui-compatibility dev
```

Open http://127.0.0.1:5180. The theme selector loads complete exports for the fixed
inputs in `presets.ts`: default, quiet tonal with warm paper, saturated tonal,
and saturated soft with warm paper. The exact input is displayed on the page.
Generated CSS and copied fonts are ignored by Git.

For each preset, compare both modes and canvas/muted/elevated/accented surfaces.
Check action variants, disabled/loading states, all badge variants, alert text,
progress, checked controls, and borders. Use Tab to inspect focus and pointer
interaction to inspect hover/active treatments. Submit an invalid email, correct
it, inspect the success toast, and open the confirmation to inspect a solid
warning alert inside a portal. Also check 320px reflow and desktop widths.

Regenerate the themes after engine changes before checking the standalone
export. Passing generator tests does not replace these browser checks.
