# Better animation

Make state changes clear and interactions responsive. Start by deciding whether
motion earns its attention cost, then choose the smallest implementation that
serves the interaction. Adapted from Emil Kowalski's animation skills.

## Follow the requested work

- **Build or fix:** implement the requested motion and verify it. A request to
  improve existing animations authorizes scoped fixes, not just a report.
- **Review or audit:** inspect without editing unless fixes are also requested.
  For a diff, distinguish introduced problems from existing ones.
- **Find opportunities:** propose a few worthwhile additions and explain meaningful
  rejections. Do not manufacture motion to fill a quota.
- **Name an effect:** answer the terminology question directly using
  [vocabulary.md](better-animation/vocabulary.md); do not start an implementation.

Read the target project's instructions, component code, motion tokens, animation
facilities, supported platforms, and relevant preview/check commands. Keep its stack,
native conventions, component primitives, and motion language. Reuse working tokens
before adding new ones; a different curve is not automatically a defect. Express
the intended behavior first, then implement it with the target technology's APIs.

This reference owns motion purpose, timing, continuity, gestures, and rendering
cost. [better-polish](better-polish.md) covers visual polish. [better-accessibility](better-accessibility.md) covers reduced-motion
preferences, equivalent input access, and non-motion state cues. Consult those
references only when the task needs their details; check motion accessibility here
regardless. For a cross-domain review, use [better-ui-review](better-ui-review.md)'s scope, severity,
and report format. Report each root cause once.

## Decide whether to animate

Name the purpose: feedback, spatial continuity, state indication, preventing a
jarring change, explanation, or occasional delight. Judge frequency from the actual
flow; state an assumption when usage is unknown.

| Use | Motion budget |
| --- | --- |
| Repeated shortcuts, command palette toggles, rapid navigation | Prefer instant changes; do not delay the next action |
| Frequent hover, selection, or press feedback | Subtle and brief, or static feedback |
| Occasional menus, dialogs, drawers, toasts | A short transition can explain the change |
| Rare onboarding, demonstrations, celebrations | More expressive motion when it serves the experience |

Keyboard input alone does not make an interaction different: retain equivalent
feedback, focus, and access across input methods. Avoid moving data people are
reading or making routine work wait for decoration. When proposing opportunities,
reject motion without a purpose. When implementing a specific request, respect the
user's intended experience and explain any consequential tradeoff.

## Choose the implementation

| Need | Starting point |
| --- | --- |
| Hover, press, reversible state changes | The platform's state-driven transition on explicit properties |
| Entry, exit, or layout changes | Existing component or presentation lifecycle support |
| A staged sequence | A timeline or keyframes when restarting is appropriate |
| Programmatic playback | Existing animation controls with cancellation and cleanup |
| Gestures and momentum | The platform's gesture system and interruptible springs |
| Navigation and system surfaces | Native or established component transitions |

Do not add a dependency for a simple fade. Reuse accessible menus, dialogs, and
drawers rather than rebuilding their behavior to get an animation.

Prefer translation, scale, rotation, and opacity when they avoid layout work in
the target renderer; name each animated property. Use layout animation only when
the layout must actually change, such as an accordion, and
measure its cost. Use the renderer's efficient animation path where available;
an API or thread name alone does not make every property cheap. Read
[timing-and-performance.md](better-animation/timing-and-performance.md) for curves,
durations, springs, and performance decisions.

## Keep motion continuous

Retarget from the current visual state when toggled or reversed. Do not restart a
rapid interaction from its original keyframe. Preserve velocity when a gesture
hands off to a spring, and clean up interrupted animations and listeners.

Anchor popover scaling to its trigger; keep unanchored dialogs centered. For a
panel entrance, start near full scale with opacity rather than zero size. A plain
fade is valid when movement adds nothing. Keep entry and exit spatially related,
with shorter or subtler exits where appropriate. Preserve presentation long enough to
render an exit without leaving invisible controls interactive.

Read [patterns.md](better-animation/patterns.md) for popovers, tooltips, dialogs, drawers,
toasts, accordions, stagger, crossfades, and drag behavior.

## Include reduced motion and input behavior

Honor system and application reduced-motion preferences across every animation path.
Remove nonessential translation, scale, parallax, and bounce. Use instant state changes or a brief fade
when it helps; a fade is optional. Keep content visible, final states correct, and
feedback understandable when animation is disabled. Completion logic must not
depend solely on a callback that a disabled animation will never emit.

Use hover-only movement only on inputs that support hover. Preserve touch press
feedback, keyboard focus, and other supported input methods. Motion never supplies
the only state cue or delays focus management and essential interaction.

## Verify and report

Exercise normal entry and exit, rapid repetition, reversal, and content changes.
Check reduced motion, keyboard operation, and touch or gestures where relevant.
Inspect at normal speed, then slow playback to expose timing and origin mistakes.
Profile under representative load before claiming smoothness or dropped frames.

Run relevant project checks. State what was inspected and what remains unverified;
source inspection alone cannot establish how motion feels. For implementation,
report what changed, the chosen timing, and verification briefly. For reviews,
audits, opportunities, and requested plans, use
[review-and-planning.md](better-animation/review-and-planning.md).

## Optional implementation examples

For a web project using the original polish recipes, consult
[web motion recipes](better-polish/motion-recipes.md) only when one matches the
requested component. Their exact values are examples, not overrides of the motion
principles or the target project's conventions.
