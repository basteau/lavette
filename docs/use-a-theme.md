# Use an exported theme

Add a Lavette theme to an existing app with Nuxt UI 4 and Tailwind CSS 4 installed.
The export supports both Nuxt and Vue with Vite.

## Download the theme

1. In the studio, select **Export theme**.
2. Select **Download theme ZIP** and unzip it.
3. Copy `lavette-theme.css` beside your main stylesheet and merge the included
   `public/fonts/` folder into your project. All selected fonts and licenses are included.
4. Import the CSS as described below or in the included `README.md`.

The ZIP contains the CSS, fonts, licenses, and installation instructions.
The **Only need the code?** section lets you copy or download the CSS separately.

## Import the CSS

1. Place `lavette-theme.css` next to your app's main CSS file.
2. Import it after Tailwind CSS and Nuxt UI:

   ```css
   @import "tailwindcss";
   @import "@nuxt/ui";
   @import "./lavette-theme.css";
   ```

Keep the complete stylesheet. It contains rules for Nuxt UI status colors as
well as color tokens. Removing those rules changes fills, labels, and hover
states. See [status colors](theme-reference.md#status-colors) for the token details.

The export supplies all seven color scales. You do not need an `app.config.ts`
color mapping. Nuxt UI’s default control sizes are preserved.

## Add the fonts

1. Copy the included font files and their OFL licenses into your app's
   `public/fonts/` directory.
2. If your app serves assets from a different base path, update the `/fonts/`
   URLs in `lavette-theme.css`.
3. To use the selected display font for a heading, add these classes:

   ```html
   <h1 class="font-display font-normal leading-display tracking-normal">
   	Your page title
   </h1>
   ```

## Check the result

1. View a heading, body text, and a button to check that the selected fonts load.
2. Add `.dark` to the root `<html>` element to check dark mode. In Nuxt, use
   Nuxt Color Mode to manage that class if your app already uses it.
3. Remove `.dark` to return to light mode.
4. Check your custom components in both modes, including hover and keyboard
   focus states.

The export checks specific foreground and background pairs, not every possible
component combination. See [contrast targets](theme-reference.md#contrast-targets)
for the limits of those checks.
