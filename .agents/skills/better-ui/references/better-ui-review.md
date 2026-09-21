# UI review

Coordinate reviews across UI domains. Focused domain reviews can reuse the severity
and reporting guidance here without expanding their scope. Build and improvement
requests follow their domain guidance; this reference applies when a review is
requested. Reviews are read-only unless fixes are also requested.

## Establish scope and evidence

Identify the requested surface, flow, or change and the project's conventions.
For a diff, inspect surrounding behavior and distinguish introduced defects,
regressions, and pre-existing issues. For a large surface, state the inspected
boundary and coverage gaps rather than implying complete coverage.

Select relevant domains from [the router](../SKILL.md). A comprehensive review
covers every domain applicable to the surface, including landing-page intent or
mobile browser behavior where relevant. Load supporting detail only when a finding
or check needs it; domain references own their design principles and checks.

Inspect the affected states and use rendered evidence when appearance, input, or
motion determines the result. Trace shared components and tokens before assigning
a cause. Cite source at `path/to/file:line`, or identify the exact screen and
component when source is unavailable. Keep unverified risks distinct from findings.

## Rank by user impact

- **HIGH:** blocks a task, misleads users, hides essential content or controls,
  risks data loss, or creates a repeated systemic failure.
- **MEDIUM:** meaningfully harms comprehension, efficiency, adaptability, or consistency.
- **LOW:** isolated polish with limited task impact.

Prioritize confirmed accessibility and task blockers, then severity and reach.
Report each root cause once with its confirmed affected locations, even when it
crosses domains. Propose a correction at the shared cause, preserving the requested
visual direction and functionality.

A stylistic preference alone is not a defect. For a requested design critique,
include opportunities grounded in the brief and rendered evidence, such as weak
hierarchy or density unsuited to the task. Separate these from functional defects;
a deliberate design choice is not a blocker merely because a recipe differs.

## Report

Start with the inspected scope. For a review spanning domains, summarize coverage
with each domain's evidence and result: findings, clear, or not verified. A focused
review needs only a short scope statement. “Clear” requires inspection.

Present one finding per root cause, ordered by impact. Include severity, location,
observed behavior, proposed correction, and the effect on the user. Use a table
when it improves scanning:

| Severity | Domain | Location | Observation | Correction | User impact |
| --- | --- | --- | --- | --- | --- |

For change reviews, label introduced defects and regressions; put pre-existing
issues separately and exclude them from the change verdict. Keep the report
proportionate to the scope and include every confirmed blocker. With no findings,
state “No actionable UI findings.”

Report verification results and unavailable checks. Source inspection cannot
establish visual quality, motion feel, or device behavior. If fixes were requested,
verify the affected behavior again after implementing them.

For a readiness or change verdict, use Block when a HIGH finding remains, or
Approve for the inspected scope when evidence supports it. If missing verification
prevents a verdict, state that it is incomplete. A design critique can conclude
with prioritized opportunities instead of an approval verdict.
