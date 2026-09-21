---
name: better-ui
description: "Create beautifully crafted interfaces with focused guidance for composition, interaction, and refinement."
disable-model-invocation: false
---

# Better UI

Build interfaces whose composition, content, and behavior feel deliberately designed
for the product. Keep the user's visual direction and the project's platform,
components, and tokens. Treat aesthetic recipes as starting points; accessibility
requirements and functional correctness remain constraints.

Route by the requested outcome. Read the smallest relevant set of Markdown
references, then follow supporting links only when needed:

| Prompt concerns | Read |
| --- | --- |
| Landing page, campaign, launch, offer, or conversion-focused page | [better-landing-page](references/better-landing-page.md) first |
| Create a screen or flow, redesign, “make it beautiful,” or improve overall craft | [better-craft](references/better-craft.md) first |
| Decisions, forms, feedback, loading, completion, perceived speed | [better-interaction](references/better-interaction.md) |
| Keyboard, focus, semantics, screen readers, hit areas, reduced motion | [better-accessibility](references/better-accessibility.md) |
| Grouping, spacing, alignment, responsive layout, overflow, RTL | [better-layout](references/better-layout.md) |
| Labels, errors, empty states, instructions, tone, terminology | [better-writing](references/better-writing.md) |
| Fonts, hierarchy, wrapping, line height, truncation, text rendering | [better-typography](references/better-typography.md) |
| Palettes, tokens, themes, contrast, semantic color | [better-colors](references/better-colors.md) |
| Surfaces, radii, shadows, icons, optical alignment | [better-polish](references/better-polish.md) |
| Transitions, easing, gestures, springs, motion performance, effect names | [better-animation](references/better-animation.md) |
| Mobile web or PWA feel, sticky hover, tap feedback, viewport or keyboard bugs, safe areas, scroll ownership, browser chrome | [better-pwa](references/better-pwa.md) |
| Review or audit across UI domains | [better-ui-review](references/better-ui-review.md), plus the relevant domains |

When implementing or reviewing UI in a Tailwind CSS v4 project, also read
[tailwind](references/tailwind.md).

Combine domains when the task crosses their boundaries. A label rewrite needs
writing; an overflowing label also needs typography or layout. Broad creation
starts with better-craft; landing pages start with better-landing-page. Each loads
domain guidance as its decisions arise. Cross-domain reviews start with
better-ui-review; focused reviews use their domain. “Make this better” authorizes
scoped improvements. Infer the surface from the current task;
ask only when missing context would materially change the work.

Build or fix when requested, answer focused questions directly, and keep reviews
read-only unless fixes are requested. Review reporting sections apply only to
reviews. Verify changes with the project's relevant checks and rendered states;
state what could not be verified. Report shared causes once.
