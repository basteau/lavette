# Better PWA

Make mobile web interfaces respond naturally to touch, browser chrome, and the
software keyboard. Adapted from Emil Kowalski's `mobile-native` skill. Applies to
web apps in browser tabs and installed standalone mode, not React Native.

## Follow the requested work

Build or fix the requested behavior; keep reviews read-only unless fixes are also
requested. Inspect the project's browser support, styling, metadata APIs, scroll
containers, and existing components before choosing a change. Prefer CSS and
metadata over device detection or new JavaScript machinery. Apply each fix where
its symptom occurs, rather than installing a global reset.

This reference covers the mobile platform layer. Installation, service workers,
offline caching, and push are separate work when requested; visual fixes alone do
not make an app installable or offline-capable.

[better-animation](better-animation.md) owns motion timing and gesture handoff;
[better-accessibility](better-accessibility.md) owns semantics, focus, hit areas,
zoom, and equivalent input access. [better-layout](better-layout.md) owns responsive
structure; [better-typography](better-typography.md) owns text and input sizing.
Read their details only when needed. Preserve these requirements in every fix and
report shared causes once.

## Match the symptom

| Symptom | Start with |
| --- | --- |
| Hover remains after a tap | Gate hover styling by input capability |
| Gray or blue tap flash fights custom feedback | Replace the tap highlight only with visible press feedback |
| Full-screen layout hides its bottom action | Choose `dvh` or `svh` for the intended viewport behavior |
| Focus zooms or the keyboard covers a field | Check computed input size and keyboard viewport behavior |
| Taps feel slow | Immediate press feedback; check `touch-action` and main-thread work |
| Scrolling a sheet moves or refreshes the page | Define scroll ownership and contain overscroll |
| Notch or home indicator covers controls | Pair edge-to-edge viewport settings with safe-area padding |
| Holding a control selects its label | Restrict selection suppression to controls |
| A swipe fights page scrolling | Separate native scrolling from custom gesture ownership |
| Browser or installed-app chrome clashes with the page | Align supported theme and launch metadata |

## Touch feedback and activation

Gate decorative hover styles with `@media (hover: hover)`. Add `(pointer: fine)`
when the effect also needs precise targeting. Inspect generated CSS before adding
framework configuration; an existing hover utility may already include the guard.
These queries describe the primary input, not every attached device. Keep touch,
mouse, stylus, and keyboard paths usable together; neither width nor a user-agent
string reliably identifies a touch device.

Use `:active` for immediate press feedback and retain `:focus-visible` for keyboard
focus. If JavaScript must track a press, start feedback on `pointerdown` and clear
it on release or cancellation. Keep ordinary activation on native `click` or form
submission so scrolling away can cancel a tap and keyboard activation still works.
Use the project's motion tokens; do not delay an action for the feedback animation.

`touch-action: manipulation` on tappable controls permits panning and pinch zoom
while removing double-tap zoom handling. It can remove the associated click delay;
it cannot fix a blocked main thread or a slow handler. Measure before adding handlers.

Set `-webkit-tap-highlight-color: transparent` only on controls with a verified
replacement press state. A global reset is appropriate only when all affected
controls provide that feedback. Do not remove a focus indicator with the highlight.

Use `user-select: none` and, where needed, `-webkit-user-select: none` on control
labels or drag handles. Scope `-webkit-touch-callout: none` to controls whose
long-press menu conflicts with their operation. Keep prose, errors, addresses, and
identifiers selectable, and preserve useful link and image context menus.

## Viewport, safe areas, and the keyboard

Keep a single viewport declaration through the project's metadata system:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Use `viewport-fit=cover` when painting edge to edge, paired with content insets.
Never add `user-scalable=no` or a restrictive `maximum-scale` to fix layout or focus.

- Use `100dvh` when a shell or drawer should follow expanding and collapsing
  browser chrome. Prefer `min-height` for growing content; fixed-height shells
  need a deliberate scroll container so content and actions remain reachable.
- Use `min-height: 100svh` for a stable first screen that should fit with browser
  chrome expanded. Dynamic units can cause unwanted resizing during a hero's scroll.
- Keep a preceding `100vh` fallback only when the support matrix needs it. Neither
  `dvh` nor safe-area insets alone guarantee clearance above the software keyboard.

Let backgrounds reach the edges while padding controls and content away from
cutouts and the home indicator. Preserve the normal spacing token, for example:

```css
.bottom-bar {
  padding-bottom: calc(var(--space-4, 1rem) + env(safe-area-inset-bottom, 0px));
}
```

Check top, bottom, left, and right insets, especially in landscape. Account for
insets once per edge; do not double-pad nested chrome. Fixed overlays need their
own clearance, and underlying content needs enough space to scroll past them.

For iOS focus zoom, check that the computed input, textarea, and select font size
is at least `16px`; `1rem` only meets that floor when the root size does. Preserve
user zoom. Set suitable `type`, `inputmode`, `autocomplete`, and `enterkeyhint`;
disable autocapitalization or autocorrection only for fields such as codes and
usernames where correction is harmful. Keep paste and native form behavior.

For a keyboard-sensitive shell, consider `interactive-widget=resizes-content`
where supported and appropriate. Do not assume identical resizing across browsers.
First use normal scrolling and the project's existing keyboard handling; introduce
Visual Viewport logic only for a reproduced obstruction that needs it. Verify field
focus, typing, dismissal, and access to the submit action with the keyboard open.
If landscape text inflation is the specific problem, consider
`-webkit-text-size-adjust: 100%` and verify text resizing remains usable.

## Scroll and gesture ownership

Keep native overflow scrolling and CSS scroll snapping for ordinary carousels;
choose snap strictness that leaves all slide content reachable. A native horizontal
scroller needs the browser to retain horizontal panning, so do not give it the
`pan-y` rule intended for a JavaScript-driven horizontal drag.

For custom gestures, `touch-action` names what the browser may handle. A horizontal
drag surface can use `pan-y pinch-zoom`; a vertical drag handle can use
`pan-x pinch-zoom`. Keep sheet content scrollable and put restrictions on the
smallest gesture surface. Check ancestor rules too: a permissive child cannot
undo an ancestor's restriction. Avoid `none` on ordinary controls and content;
it disables browser panning and zoom. Handle `pointercancel` without firing an
action or leaving feedback stuck, and retain an accessible alternative to dragging.

Use `overscroll-behavior-y: contain` on an inner vertical scroller when reaching
its edge should not scroll the page behind it. Suppress root pull-to-refresh only
when it conflicts with the app's interaction; choose `contain` to retain local
overscroll effects or `none` when those also conflict. Limit suppression to the
needed axis so browser navigation is preserved where possible. Keep ordinary
document scrolling and intentional refresh behavior.

Overscroll containment is not a complete modal implementation. Reuse the project's
dialog or sheet primitive for background scroll locking, focus, and restoration.
Do not cancel every `touchmove` to solve scroll chaining.

## Browser chrome and installed appearance

Use supported `theme-color` metadata to suggest a browser chrome color matching
the adjacent page surface. For system-driven themes, supply light and dark media
variants. For an in-app theme override, keep the active metadata synchronized with
the actual theme. Declare `color-scheme` only for schemes the interface supports.

When installed mode is in scope, align the manifest's `theme_color` and launch
`background_color` with the app. Treat platform-specific status-bar settings such
as `apple-mobile-web-app-status-bar-style` separately: they are not arbitrary color
values, and `theme-color` is not a cross-browser guarantee. Verify the launch screen,
status bar contrast, safe areas, and page background in the supported display modes.

## Verify and report

Use desktop tools to inspect CSS, metadata, overflow, and input paths. Emulation
helps with layout but cannot establish real touch feel or all browser behavior.
Exercise the affected flow on supported phones: expanded and collapsed browser
chrome, portrait and landscape, keyboard open and closed, scroll boundaries,
cancelled taps, pinch zoom, and theme changes. Include installed standalone mode
when targeted, and representative older hardware when performance is at issue.

Use the project's device-preview setup and Safari Web Inspector or Chrome remote
debugging when available. Run relevant project checks. If hardware is unavailable,
finish the code-verifiable work and identify exactly which device checks remain
unverified; do not claim a device result from source inspection or emulation.

For implementation, briefly report the symptom, changed behavior, and verification.
For reviews, use [better-ui-review](better-ui-review.md)'s evidence, severity, and
report format without loading unrelated domains.
