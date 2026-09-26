# Use an exported theme

For an existing app with Nuxt UI 4 and Tailwind CSS 4 installed. The same CSS
works in Nuxt and Vue with Vite.

1. Select **Export theme**, then **Download CSS** or **Copy CSS**.
2. Save it as `lavette-theme.css` beside your app's main stylesheet.
3. Import it after Tailwind CSS and Nuxt UI:

   ```css
   @import "tailwindcss";
   @import "@nuxt/ui";
   @import "./lavette-theme.css";
   ```

Your main stylesheet should already be loaded through Nuxt's `css` option or
an import in your Vue/Vite entry point. Keep your existing `UApp` wrapper.
No additional configuration or local font files are needed. Existing component
sizes continue to apply.

## Fonts and headings

The CSS loads the selected pairing and Geist Mono directly from Google's font
servers. It includes the same size adjustments used in the preview. Fallback
fonts display while loading or if Google is unavailable. If your app has a
Content Security Policy, allow `https://fonts.gstatic.com` in `font-src`.

Body text and controls use the selected sans font. For display headings, add:

```html
<h1 class="font-display font-normal leading-display tracking-normal">
  Your page title
</h1>
```

## Dark mode

Toggle `.dark` on the root `<html>` element, using Nuxt Color Mode if installed.
Check custom components in both modes, including hover and keyboard focus.
Keep the complete CSS: its semantic utility rules provide the intended status
fills, labels, and hover states alongside the color tokens.
