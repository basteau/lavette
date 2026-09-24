# Readiness review — 25 September 2026

Reviewed the palette/theme generators, font and sizing exports, studio state and
controls, component examples, responsive layout, and installation flow.

## Findings addressed

| Impact | Finding | Change |
| --- | --- | --- |
| High | Installing a theme required separate CSS, configuration, font, and license downloads; missing fonts changed the result. | One ZIP contains all selected assets, exact settings, and framework-specific instructions. Failed asset requests prevent partial packages. |
| Medium | Brand actions became nearly black because text and filled controls shared one contrast-constrained color. | Primary and secondary now use the same separate text/fill/hover/tint treatment as status colors, with contrast checks. |
| Medium | Reloading replaced the current design with a random theme. | A consistent initial theme and local draft restoration preserve work. |
| Medium | Desktop and mobile maintained duplicate settings forms. | One shared component; size and focus controls sit under Control details. |
| Medium | At 320px the export description collided with the close action and the download action sat below long instructions. | Reserved header space and a fixed modal footer keep the download reachable. |
| Low | The decorative star rendered as a colored emoji instead of following the theme. | A Lucide icon renders consistently. |

## Verification

- `pnpm test`: 20 tests pass, including independently extracted archives for every
  pairing and both frameworks, font/license completeness, missing-asset rejection,
  color gamut, and contrast sweeps at control extremes.
- `pnpm build`: passes, including TypeScript.
- The standalone Nuxt UI/Vite fixture builds. Browser checks cover light/default
  and saturated/accented surfaces, button variants, dark mode, and a warning dialog.
- The new Nuxt 4.5.2 fixture builds its client and SSR server from an extracted ZIP.
  Its production server renders the selected fonts, large native control defaults,
  both color modes, and a portalled dialog with no captured console warnings/errors.
- Studio browser checks cover desktop, 390px, and 320px layouts, keyboard slider
  changes, draft restoration, ZIP download feedback, and light/dark themes.
- At 320px the final download button stays within the viewport while instructions scroll.

## Remaining limits

The studio now separates the showcase and Vue runtime from its entry chunk.
The entry is approximately 449 kB (132 kB gzip), the showcase 307 kB, and the Vue
runtime 136 kB. The total application still contains the full component preview;
chunking reduces the entry size and allows separate caching. The production build
has no chunk-size warning. Direct links such as `#components` are restored after
the asynchronous showcase mounts, and the production ZIP download was verified.

A version-pinned Nuxt UI patch normalizes `aria-hidden` before forwarding it to
Iconify. Fresh development previews, including open selects, report no captured
warnings/errors. See [patch notes](../patches/README.md) for removal criteria.

Safari/Firefox and older Nuxt UI releases were not tested. Custom project CSS can
override exported tokens, so the checks establish a supported starting point,
not accessibility of arbitrary apps.
