# Reviews, opportunities, and plans

## Resolve scope and gather evidence

For a component, inspect all relevant states. For a diff, read changed motion and
the surrounding primitives and tokens. For an app audit, map shared components
before sampling individual screens. State the inspected boundary and coverage gaps.

Locate transitions, timelines, animation configuration, gesture handlers, presentation
logic, reduced-motion handling, and easing/duration tokens. Search results are
candidates; read their context before treating them as findings.

Check purpose and frequency, timing, origin, interruption, rendering cost,
accessibility, and consistency. Consolidate a shared token defect into one finding
with its confirmed uses. Missing local reduced-motion handling may be covered by
a platform default, shared policy, or component configuration; trace it before reporting.

## Prioritize actual effects

Severity follows evidence and user impact, not a mismatched magic number. Respect
deliberate choices unless a concrete problem remains. Distinguish observed jank
from a plausible performance risk. Pure fades, keyboard activation, a library's
transform API, or a justified larger-surface duration are not automatic blocks.

Prefer deleting unjustified motion, reducing travel or delay, correcting timing or
origin, and fixing interruption before adding effects or another abstraction.

## Report a review

Use [better-ui-review](../better-ui-review.md) for severity and reporting without
loading unrelated domains. When proposing a timing change, give concrete target
values or existing token names. Keep observed jank distinct from an unmeasured
performance risk.

## Find opportunities

Look for unclear feedback, disconnected surfaces, jarring state swaps, and occasional
moments that would benefit from continuity. Apply the purpose and frequency gate
from [better-animation](../better-animation.md) before proposing anything. A small set of strong candidates is enough.

For each, provide location, current behavior, purpose, frequency assumption, and
the proposed properties, timing, origin, interruption, and reduced-motion behavior.
Mention rejected candidates only when they explain a useful decision. Keep
suggestions separate from defects; static UI is not inherently broken.

## Write a plan when requested

Use the target project's planning convention; do not create a new tracker or plans
directory by default. Include the problem and evidence, affected files, existing
component/token conventions, exact target behavior and values, implementation
steps, and boundaries. Specify reduced motion, interruption, and exit lifecycle.

Make verification executable: project commands plus interactions and observable
outcomes, including normal and slowed playback, rapid reversal, and relevant input
methods. Record the revision when useful to identify drift. If the user asked for
implementation, carry out scoped fixes and verification rather than stopping at a
plan or imposing a second selection step.
