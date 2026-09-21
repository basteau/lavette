# Interaction and feedback

Use this when designing choices, forms, asynchronous states, or flow completion.
For control semantics and input access, read [accessibility](better-accessibility.md);
for the words themselves, read [writing](better-writing.md).

## Make the next decision clear

Group choices by the user's task and give the likely next action appropriate
emphasis. Put secondary settings behind a labeled disclosure when hiding them
reduces distraction without obscuring frequent work. Keep expert workflows dense
when scanning and comparison benefit from seeing the choices together.

Use familiar interaction patterns and consistent meanings for repeated controls.
Judge grouping by comprehension and task frequency, rather than a fixed number
of items. Show current position and meaningful progress in multi-step work; let
people revisit earlier choices without losing their input.

## Absorb formatting work

Accept harmless formatting differences where the domain permits, and normalize
for display or storage. Keep validation faithful to the underlying data contract.
Ambiguous dates, identifiers, and consequential values need explicit interpretation;
preserve the user's input when asking them to correct it. Retain entered data
after a failed submission and put recovery beside the affected control.

## Acknowledge input before the network finishes

Show press, selection, or pending feedback promptly. Keep the control's purpose
recognizable while work is pending and prevent duplicate consequential submissions.
Retain usable content during refresh; reserve space for arriving content so actions
and reading positions stay stable. Use skeletons when the expected structure is
known, and progress indicators when they communicate useful waiting information.

Optimistic updates suit reversible, predictable operations with a defined rollback
and an error path. A failed update must restore consistent state and explain how
to recover. Show consequential completion only after confirmation. Represent
progress honestly; decorative timing cannot establish that work succeeded.

## Finish the flow

Make success visible where the action happened: the saved state, created item,
receipt, or next useful step. Match the prominence to the consequence and frequency;
a routine save may need only a quiet status. Keep undo or recovery reachable when
appropriate. Verify success, failure, retry, and repeated activation, including
slow responses and responses arriving out of order.

## Address perceived latency selectively

Measure where the wait occurs before adding prefetching or animation. Reuse the
project's routing and cache facilities. Where useful, prefetch likely destinations
from supported intent signals such as focus or hover, with a touch path that works
without a cursor. Keep speculative requests bounded and free of mutations; respect
cache freshness and the project's data and bandwidth constraints. Verify a useful
latency improvement before introducing prediction machinery.

Keep motion subordinate to readiness: users should be able to act as soon as the
interface is ready. See [animation](better-animation.md) for transition continuity.
Sound, if requested, supplements visible feedback, follows an explicit sound
preference, and stays proportionate to the action. Reduced-motion settings do not
replace a sound preference.

For reviews, use [the review format](better-ui-review.md#report) and report
observed failures with their effect on the task.
