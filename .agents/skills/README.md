# Better

**One entry point. Four focused skills. Fewer decisions.**

A technology-independent interface-design collection informed by Emil Kowalski, Jakub Krehel, Paul Bakaus's Impeccable, and Josh Puckett. Its agent-facing structure follows Matt Pocock's *writing-for-agents* guidance. This is a new synthesis, not an official bundle or a reproduction of anyone's curriculum.

## The collection

| Skill | The question it answers |
| --- | --- |
| **[better-interface](better-interface/SKILL.md)** | What is the real problem, and what is the smallest coherent improvement? |
| [better-layout](better-layout/SKILL.md) | Does space explain hierarchy and relationships? |
| [better-content](better-content/SKILL.md) | Is the meaning clear and easy to read? |
| [better-style](better-style/SKILL.md) | Does the visual language have purpose and character? |
| [better-interaction](better-interaction/SKILL.md) | Are actions dependable, feedback clear, and motion worthwhile? |

You need remember only **better-interface**. It normally reads one or two workers, not the entire collection. Each worker also supports direct use. A full audit deliberately visits all four.

There are no separate audit, polish, accessibility, typography, writing, color, or animation commands. Audit is a mode. Polish is the last part of the relevant domain. Typography and language share ownership of meaning; motion and behavior share ownership of feedback. Accessibility is a requirement within each domain, never an optional fifth pass.

## The design philosophy

**Clarity and coherence, without erasing character.**

Start with the user's task and what already works. Make the fewest distinctions that explain the content and behavior. When the brief calls for expression, develop one expressive idea first rather than offering a gallery of unrelated directions. Domain defaults are fallbacks, not quotas or a mandatory neutral aesthetic.

A small repair stays small: no new direction, system, or audit without a reason. Fix shared causes rather than individual symptoms. Preserve the original when a proposed change is not better supported by the brief. Simplify the decision system, not the person's capabilities.

### Rhythm, concretely

Josh Puckett's major/minor rhythm idea is central: choose two named vertical gaps and reuse them by default.

Minor connects related items; major separates meaningful groups. Choose values in representative content and judge the visible relationships across the whole surface. There is no prescribed ratio or line-height formula. Without rendered evidence, exact values remain provisional.

Preserve coherent existing relationships. Unequal values may create equal perceived gaps; optical corrections, hit targets, text leading, and native control metrics need not fit the rhythm. The constraint prevents arbitrary decisions, not purposeful differences. [better-layout](better-layout/SKILL.md) owns the detailed guidance.

### Tune, then commit

Borrow the useful idea behind DialKit without requiring the library: name an uncertainty, adjust only the few parameters that can resolve it, and compare one bounded change with the original in the actual task. Seek human judgment when subjective fit is consequential; commit the better result or keep the original. A design tool, native preview, or existing controls can serve this purpose. No new tuning tool is required.

## Use

These files are authored here; they have **not been installed globally or automatically registered** with an agent.

Install the collection as a bundle whose five `better-*` directories remain readable siblings. The workers depend on `better-interface/references/foundations.md`. Separate-directory or sandboxed installers are unsupported unless they preserve access to the shared file and router targets. Verify both router-led and direct-worker loading in the chosen host; this directory is not automatically registered just because it contains skills.

Keep this README, `SOURCES.md`, and `licenses/` with any redistributed bundle. The upstream notices do not assign a blanket license to the new contributions; choose one before public publication.

No host-specific invocation flags, delegation APIs, shell commands, dependencies, or framework conventions are required. The router can read worker files directly. With an agent that lacks skill discovery, point it at `better-interface/SKILL.md` and ask it to follow the file and its relative links.

Example requests:

- “Use better-interface to refine this screen. Preserve its identity and fix the main problem.”
- “Use better-interface for a full audit. Findings only; do not edit.”
- “Use better-layout to establish a consistent minor/major rhythm.”
- “Use better-interaction to remove friction from this repeated keyboard workflow.”

The medium may be a web app, native product, terminal interface, design file, prototype, or specification. Platform-specific standards are labeled; pixel values and web APIs are not treated as universal implementation instructions. Work requiring a different specialty, such as industrial design or safety-critical certification, is outside this collection's claims.

## Maintenance

Keep one router and four workers. A rule has one domain owner; extend that domain rather than adding commands. Shared priorities live in [foundations](better-interface/references/foundations.md); sources and research stay out of routine agent context. Add a reference only when a real conditional branch earns it.

See [SOURCES.md](SOURCES.md) for research, attribution, deliberate departures, and license notices. See [EVALUATION.md](EVALUATION.md) for acceptance scenarios and the limited tests actually performed. These skills have initial smoke tests, not a demonstrated improvement over a baseline model.
