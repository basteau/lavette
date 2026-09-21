# Interaction patterns

These specify behavior rather than a framework. Implement them through the target
platform's component primitives, gesture recognizers, presentation lifecycle, and
animation facilities. Keep existing focus, dismissal, and navigation behavior.
Values are starting points where the project has no established motion convention.

## Press feedback

For a control that benefits from physical feedback, begin around 97% of its resting
scale over 100–160ms. Keep an established nearby value, such as 96%, instead of
introducing a competing one. Reflect the press immediately and handle cancellation
without activating the action. Do not shrink its hit area along with the visual.

Under reduced motion, keep scale unchanged and use static color, surface, or label
feedback. Hover behavior is optional and only available on capable input devices;
it cannot be the only way to discover or use the control.

## Popover, menu, tooltip, dialog

| Surface | Initial state | Settled state | Starting timing |
| --- | --- | --- | --- |
| Anchored popover or menu | 95% scale, transparent, origin at trigger | Full size and opacity | 200ms ease-out |
| Tooltip | 97% scale, transparent, origin at trigger | Full size and opacity | 125ms ease-out |
| Unanchored dialog | 96% scale, transparent, centered | Full size and opacity | 250ms ease-out |

Use the primitive's anchor geometry, including when placement flips. Coordinate a
dialog's backdrop with its surface. Under reduced motion, omit scale and use an
optional short opacity transition or instant change. A pure fade also works when
spatial movement adds nothing.

For pointer tooltips, a first-hover delay avoids accidental activation. Once one is
open, adjacent tooltips can skip delay and animation. Preserve the platform's focus
and assistive-technology behavior rather than requiring hover.

## Drawers, sheets, and toasts

Move a bottom sheet by its measured height when it must leave the viewport. Use
the drawer curve from [timing-and-performance.md](timing-and-performance.md) when
there is no established behavior. Check safe areas, shadows, and oversized content.
Exit toward the edge it came from. A small popover may need only a slight offset.

Reuse the component or platform's motion before replacing it. Rapid additions,
dismissals, and reversals must continue from their current position. Keep an
outgoing surface presented long enough for its exit while making focus and input
follow the semantic state. Check stacked notifications as heights and content change.

Use lifecycle support for insertion and removal; an entry animation alone cannot
retain a removed view for exit. The settled state should remain usable if animation
setup is unavailable. Under reduced motion, show and hide through actual state;
removing displacement must not expose a closed drawer.

## Accordions and layout changes

An accordion needs real layout change. Start around 200ms with measured expansion
and an optional opacity transition. Prefer the component or platform's layout
animation support. Test changing content, text scaling, rapid reversal, and resizing.
Prevent collapsed content from remaining focusable. Do not scale text to fake reflow.

## Stagger and reveals

Use 30–80ms gaps only when sequencing a small, infrequent group explains hierarchy.
Cap total delay so a long list does not make its last item wait. Keep interaction
available and ensure focus never lands on an invisible control. Recycled or virtualized
rows should not replay entrance animations every time they return to the viewport.

Scroll reveals suit intentional demonstrations more than daily work. Reveal once,
keep content visible if setup fails, and bypass movement and stagger under reduced
motion. Disabling animation must restore final visibility.

## Crossfades, shared elements, and masks

Tune overlap before adding effects. A slight transient blur can soften a visibly
double-exposed swap, but remove it if it harms text clarity or frame time. A shared
element should retain identity and follow a coherent path between its two states.

Keep semantic state independent of decorative copies. For example, a duplicated
tab strip used as a clipped highlight must be hidden from assistive technology,
excluded from focus, and unable to intercept input. The original owns interaction.

## Drag and swipe

Track the active contact and use the platform's gesture ownership mechanism.
Handle cancellation, release outside bounds, and competing scroll or navigation
gestures. Keep a non-drag way to perform the same action.

Dismiss using distance and directional release velocity, tuned to the component.
Use recent samples or the gesture system's velocity rather than whole-gesture
average speed: a late flick should count, a slow release after a fast start should
not. Keep units explicit; do not apply an unsigned universal threshold.

Use increasing resistance beyond a boundary, then settle from the current position
and velocity. Test reversal, an additional contact, scroll conflicts, reduced motion,
and the actual target device. Do not restart a grabbed spring from its initial state.

## Navigation and haptics

Keep native or established navigation transitions, back gestures, and system-surface
behavior. Custom motion should communicate the relationship between destinations;
do not imply hierarchy between peer tabs unless the product intentionally does so.

Where haptics exist, use them sparingly at meaningful events such as a detent or
committed action. Align them with the event, not a delayed animation completion.
Respect device capabilities and preferences, and retain equivalent visual feedback.
