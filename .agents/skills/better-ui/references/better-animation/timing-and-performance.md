# Timing and performance

## Easing and duration

Use established project tokens when they serve the interaction. Without them,
these are Emil's starting curves; preserve the numbers when choosing one:

| Curve | Cubic Bézier control points `(x1, y1, x2, y2)` |
| --- | --- |
| Ease-out | `(0.23, 1, 0.32, 1)` |
| Ease-in-out | `(0.77, 0, 0.175, 1)` |
| Drawer / sheet | `(0.32, 0.72, 0, 1)` |

These describe timing, not an API. Use the platform's equivalent curve or existing
motion token. Convert duration and coordinate units explicitly.

| Interaction | Curve | Starting duration |
| --- | --- | --- |
| Press feedback | Ease-out | 100–160ms |
| Tooltip or small popover | Ease-out | 125–200ms |
| Dropdown or select | Ease-out | 150–250ms |
| Centered dialog | Ease-out | 200–300ms |
| Large drawer or sheet | Drawer curve | 200–500ms, tuned to travel distance |
| Movement between positions on screen | Ease-in-out | Usually 150–300ms |
| Hover color or opacity | A gentle standard easing | Brief enough for repeated use |
| Continuous rotation or elapsed-time fill | Linear | Match the actual process |

Keep routine UI transitions below about 300ms. Native navigation, a larger sheet,
an established component's motion, or an explanatory sequence can justify more.
Preserve system transition conventions. Do not turn the budget into a rule that
contradicts the drawer range. An entrance with ease-in usually feels delayed
because it moves slowest just after the action; favor a fast start. Built-in easing
and longer durations are not findings without context.

Separate deliberate user timing from system response. A requested hold interaction
might fill over 2s and cancel over 200ms; an ordinary button should respond at once.
Animation styling does not implement confirmation, cancellation, or keyboard access.

## Springs

Use a spring when continuity and momentum matter, especially after a drag. Keep
ordinary controls restrained; visible overshoot belongs to gestures or a deliberate
playful style. Start with the platform's restrained spring preset, then tune the
perceived settling time, overshoot, and response to release velocity.

Spring parameters are not portable between engines. Mass, stiffness, damping,
damping ratio, response time, duration, and bounce may have different units or
precedence rules. Check the target API instead of copying a configuration from
another framework. When supported, critical damping (damping ratio 1) is a useful
starting point for settling without oscillation. Check the actual trajectory and
clamp where a hard boundary must never be crossed.

## Rendering cost

- Prefer transforms and opacity for movement and fades where the renderer can
  apply them cheaply. Reserve dimension changes for genuine reflow and check
  surrounding content under load.
- A small color transition can be appropriate even though it may redraw. Animate
  only intended properties; unrelated style changes should not start animating.
- Compositing depends on the property, renderer, and animation mechanism. A native
  driver, compositor, GPU, or animation API is not a blanket performance guarantee.
- Keep continuous gesture and scroll updates on the platform's efficient animation
  path. Avoid per-frame application renders, large descendant invalidations, or
  runtime crossings. Dispatch application work at meaningful state changes.
- Profile the actual bottleneck before changing an execution path. Preserve
  layout, transform composition, and gesture continuity when optimizing.
- Use small blur, shadow, mask, or clip effects only when they improve the result.
  Area and rendering implementation matter; crossfading a pre-rendered effect may
  cost less than recalculating it every frame.
- Layer promotion and caching consume memory. Add them for a demonstrated benefit,
  and avoid permanent extra layers across a whole list.

Measure against the target display's frame budget: roughly 16.7ms at 60Hz and
8.3ms at 120Hz. Check representative content and concurrent work on supported
hardware, including a slower device. For native apps, use a representative release
build; an emulator or debug build alone does not establish device performance.
Consult the target runtime's documentation for API and acceleration claims.
