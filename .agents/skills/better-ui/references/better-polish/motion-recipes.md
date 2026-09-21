# Optional web motion recipes

Preserved from Jakub Krehel's original better-ui guidance. Load only for a matching
web implementation. These are recipe-specific values, not universal requirements;
[better-animation](../better-animation.md) owns motion decisions, project-token
compatibility, reduced motion, and performance verification. Use native equivalents
on other platforms rather than introducing these APIs.

## Interruptible animations

Use CSS transitions for interactive state changes, because they can be interrupted mid-animation. Reserve keyframes for staged sequences that run once.

## Split and stagger enter animations

For an infrequent staged entrance where sequence communicates hierarchy, break the content into semantic chunks and stagger them by ~100ms. Animating one container gets you less for the same cost. Leave high-frequency interactions unstaggered. See [enter-exit.md](enter-exit.md).

## Subtle exit animations

Use a small fixed `translateY` rather than full height. Exits should be softer than enters. Use `ease-out` for both directions.

## Contextual icon animations

Animate icons with `opacity`, `scale` and `blur` rather than toggling visibility. Use exactly these values: scale `0.25` to `1`, opacity `0` to `1`, blur `4px` to `0px`.

With a motion library (`motion` or `framer-motion` in `package.json`), match that package's import path, or nearby imports where both exist. Use `transition: { type: "spring", duration: 0.3, bounce: 0 }`. Bounce is always `0`.

Without one, keep both icons in the DOM with one absolutely positioned, and cross-fade with `cubic-bezier(0.2, 0, 0, 1)`. That gives you enter and exit with no dependency. Both recipes are in [icon-transitions.md](icon-transitions.md).

## Scale on press

A `scale(0.96)` on click gives a button tactile feedback. Always `0.96`; anything below `0.95` feels exaggerated. Add a `static` prop to switch it off where motion would distract. See [recipes for CSS, Tailwind and Motion](animations.md#scale-on-press).

## Skip animation on page load

Use `initial={false}` on `AnimatePresence` to keep enter animations off the first render. Check that it leaves intentional page entrances intact.

## Suppress transitions on theme switch

A theme flip changes color, background, border and shadow on nearly every element at once. Every transition on those properties fires together and the switch smears instead of snapping. Inject `*,*::before,*::after{transition:none !important}`, force a reflow, then remove it on the next frame. See the [recipe](animations.md#suppress-transitions-on-theme-switch).

## Transition only what changes

Always name the exact properties: `transition-property: scale, opacity`. Tailwind's `transition-transform` covers `transform, translate, scale, rotate`.

## Use `will-change` sparingly

Only for `transform`, `opacity` and `filter`, which the GPU can composite. Never `will-change: all`. Add it when you see first-frame stutter, not before. See [performance.md](performance.md).

## Motion restraint

Give high-frequency interactions instant feedback, or a transition of `150ms` or less on opacity and color. A custom animation there charges its attention cost on every trigger.

Every animated state change also needs a static cue: color, an icon, or a label. Motion is never the only feedback channel.

