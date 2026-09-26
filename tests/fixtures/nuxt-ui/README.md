# Check exported themes with Nuxt UI

Use this fixture to check the complete exported CSS against real Nuxt UI
components, independently of the studio. Run it after changes to theme
generation. Passing generator tests does not replace these browser checks.

## Start the fixture

From the repository root, run:

```sh
pnpm install
pnpm --filter lavette-nuxt-ui-compatibility build
pnpm --filter lavette-nuxt-ui-compatibility dev
```

Open <http://127.0.0.1:5180>. If that port is in use, open the URL printed by Vite.

The **Theme example** selector loads exports generated from [`presets.ts`](presets.ts).
The presets cover the default theme, quiet tonal colors with warm paper,
saturated tonal colors, and saturated soft colors with warm paper. The page
shows the exact input for the selected preset.

Both `build` and `dev` regenerate the theme CSS with Google-hosted fonts. Git ignores
these generated files.

## Check each preset

Repeat these checks in light and dark mode. Use the **Surface** selector to check
`bg`, `bg-muted`, `bg-elevated`, and `bg-accented` backgrounds.

- Check text, button variants, disabled and loading states, badge variants,
  alerts, progress indicators, checked controls, and borders.
- Use Tab to check keyboard focus. Use the pointer to check hover and pressed
  states.
- Submit an invalid email to check the error message. Correct the email and
  submit again to check the success toast.
- Open the confirmation dialog to check its solid warning alert. The dialog
  renders through a portal, outside the component's normal DOM position.
- Check the layout at a viewport width of 320px and at desktop widths.

## Refresh after generator changes

To regenerate the exports while the fixture's dev server is running, use another
terminal at the repository root:

```sh
pnpm --filter lavette-nuxt-ui-compatibility theme
```

Reload the browser before repeating the checks.

For token definitions and contrast targets, see the
[theme reference](../../../docs/theme-reference.md). For the studio's setup and
unit tests, see the [project README](../../../README.md).
