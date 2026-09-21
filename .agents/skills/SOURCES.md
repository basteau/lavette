# Sources, synthesis, and attribution

The five skills and shared foundations are newly written, condensed guidance informed by the sources below. They reorganize and qualify upstream ideas rather than concatenate upstream skill files. They are not authored, endorsed, or maintained by the people cited.

This file is research documentation, not required runtime context. Repository revisions are pinned because upstream collections change materially.

## Emil Kowalski — motion that earns its time

Primary public writing inspected:

- [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations): frequency and utility should determine whether motion exists at all.
- [Agents with taste](https://emilkowal.ski/ui/agents-with-taste): explicit animation judgment and agent-usable guidance.
- [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips): restrained scale, anchoring, easing, and responsive feedback.
- [Building a toast component](https://emilkowal.ski/ui/building-a-toast-component): interruption, repeated events, dismissal timing, and real component behavior.
- [Building a drawer component](https://emilkowal.ski/ui/building-a-drawer-component): gesture continuity, scroll coordination, damping, and platform feel.

Official skills: [`emilkowalski/skills`, revision `85e8e2363b713506e1d5b6e07a0eb2da66be1bc3`](https://github.com/emilkowalski/skills/tree/85e8e2363b713506e1d5b6e07a0eb2da66be1bc3), especially `skills/emil-design-eng/SKILL.md` and `skills/animate/SKILL.md`.

**Retained:** purpose before movement; repeated work deserves speed; transitions should survive interruption; gesture behavior needs real testing; reduced motion preserves comprehension.

**Qualified:** timing ranges and easing choices are tuning defaults, not laws. His larger drawer and toast examples already demonstrate exceptions to short-duration heuristics. Keyboard-driven work defaults to immediate updates, not the claim that keyboard input can never benefit from animation. Implementation-specific statements about keyframes, transitions, or GPU acceleration are deliberately absent.

**Destination:** better-interaction. An early draft included 120ms/180ms starting values; specialist-informed review removed them because the concrete seeds could override coherent product conventions. Timing now follows distance, frequency, purpose, and observation rather than a collection-wide default.

## Jakub Krehel — coherent details, clear ownership

Primary repository: [`jakubkrehel/skills`, revision `267330e1adfc66a718fb65fa6918c1f06d0a689e`](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e).

Sources inspected include `skills/better-interface/SKILL.md`, the `better-ui`, `better-typography`, `better-colors`, `better-accessibility`, `better-layout`, and `better-writing` skills, and repository authoring guidance.

Supporting public writing:

- [Skills](https://jakub.kr/skills)
- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better)
- [Less is more](https://jakub.kr/writing/less-is-more)

**Retained:** one owner per rule; preserve useful conventions; semantic colors; measured rendered contrast; typography for real content; grouping and optical alignment; nested-corner relationships; recoverable truncation; meaningful copy; remove repeated friction.

**Changed:** fewer invocation surfaces. Typography and writing become better-content; color and surface polish become better-style. Accessibility is distributed by responsibility. The router selects domains rather than routinely loading every skill.

**Qualified:** neither OKLCH migration nor a universal font, weight floor, corner recipe, or color ban is required. The separate `oklch-skill` repository was not used as redistributable material because a license was not verified; the consolidated skills repository is MIT-licensed.

## Paul Bakaus — Impeccable's intentionality, without the command catalog

The author's name is Paul **Bakaus**. Primary repository: [pbakaus/impeccable](https://github.com/pbakaus/impeccable).

Two editions informed the research:

- [`517fcfe47efc1ba5a303864c7f1b3ab4e9031981`](https://github.com/pbakaus/impeccable/tree/517fcfe47efc1ba5a303864c7f1b3ab4e9031981): `source/skills/frontend-design/SKILL.md`, domain references, and `source/commands/critique.md`. This was also the locally available checkout inspected during research.
- [`0a4e72a254f3b175c95b36b82e5f2e60fa63f116`](https://github.com/pbakaus/impeccable/tree/0a4e72a254f3b175c95b36b82e5f2e60fa63f116): `skill/SKILL.src.md`, including purpose-sensitive direction and refinement versus redesign. This edition is substantially larger than the earlier one.

**Retained:** identify audience and purpose; decide what earns attention; examine composition and emotional fit; distinguish refinement from redesign; preserve character rather than merely make everything neutral.

**Changed:** a single direction and focused intervention replace a broad steering-command vocabulary. Questions about task, reading, persuasion, and expression stay in the router; no separate aesthetic taxonomy is exposed to the user.

**Rejected:** aesthetic blacklists, “looks AI-generated” as a quality criterion, and the assumption that originality requires unfamiliar fonts or the removal of all cards. Familiar patterns can be excellent. The quality test is whether the decisions serve the task and agree with one another.

**Corrected:** accessibility claims use W3C definitions, not older reference shorthand about 18px “large text,” 16px body text as a compliance threshold, or 44px as the universal AA target-size minimum.

## Josh Puckett — rhythm, direct manipulation, considered interfaces

Primary public sources:

- [Major/minor vertical-rhythm post](https://x.com/joshpuckett/status/2098862271661547990): verified textual recommendation to choose a major and minor spacing unit and align to them by default, including its connection to agent design. The attached video's additional content was not analyzed.
- [Experiencing design concepts through interaction](https://x.com/joshpuckett/status/2067990665582293034).
- [Interface Craft public homepage](https://www.interfacecraft.dev/): considered interfaces beyond bare functionality.
- [DialKit](https://www.dialkit.dev/) and [official agent guide](https://www.dialkit.dev/agent): bind a small set of controls to real values, tune in context, and transfer chosen values back to the implementation.
- [`joshpuckett/dialkit`, revision `4ae7f55b38c27a9fce8319c17aff1f2d5a7ab01a`](https://github.com/joshpuckett/dialkit/tree/4ae7f55b38c27a9fce8319c17aff1f2d5a7ab01a).

**Retained:** the major/minor rhythm pair; learning and judging through actual interaction; small meaningful parameter sets; care that anticipates the person's needs.

**Our synthesis:** judge perceived grouping before numerical conformity; keep purposeful optical corrections; tune only parameters that resolve a named uncertainty; compare one bounded alternative and retain the original when it is better supported. An early half-line-height/3× spacing recipe was removed after review. Josh's verified post does not prescribe pixel values, ratios, a universal grid, or the exact human/agent workflow used here.

**Boundary:** Interface Craft is a paid library. Its member-only skills and curriculum were not used or reconstructed. Third-party mirrors of purported Storyboard Animation or Design Critique skills were not treated as author-issued, licensed sources. DialKit's open-source license does not license that separate curriculum. No DialKit dependency or installation instruction is embedded in the skills.

## Matt Pocock — writing for agents

Read both original files at [`959a8e9f1edc3adbe2f7e3054bb6fbefa6696260`](https://github.com/mattpocock/skills/tree/959a8e9f1edc3adbe2f7e3054bb6fbefa6696260):

- [`skills/productivity/writing-for-agents/SKILL.md`](https://github.com/mattpocock/skills/blob/959a8e9f1edc3adbe2f7e3054bb6fbefa6696260/skills/productivity/writing-for-agents/SKILL.md)
- [`SKILL-MECHANICS.md`](https://github.com/mattpocock/skills/blob/959a8e9f1edc3adbe2f7e3054bb6fbefa6696260/skills/productivity/writing-for-agents/SKILL-MECHANICS.md)

**Applied:** descriptions with distinct trigger branches; ordered steps with checkable completion criteria; definitions and caveats kept together; a single shared foundations file; conditional domain loading; one owner per rule; pruning instructions that add no behavior; a repeatable process without prescribing identical designs.

**Portability decision:** all five files use only `name` and `description` frontmatter. We do not assume that manual-only skill flags, slash commands, context boundaries, or subagent APIs behave identically across hosts. The router explicitly reads the relevant files when invocation tooling is absent. Supporting files outside an individual skill directory require installing this collection together.

## Specialist-informed review

Two independent subagents reviewed the complete draft: one through Jakub Krehel's publicly documented interface principles, the other through Josh Puckett's public rhythm and direct-manipulation ideas. They were reviewers informed by these authors, not the authors themselves; no endorsement is implied.

Both identified overly influential numeric defaults and unnecessary procedural overhead. The revision removed spacing and duration recipes, preserved character from the start, strengthened root-cause routing and bounded tuning, and made no change an explicit successful outcome. It also added targeted checks for heading wrapping, overflow, control stability, and accessible error flows. These edits are our synthesis. The Jakub-informed reviewer revisited linked primary sources; the Puckett-informed reviewer relied on the source scope already recorded here and did not independently reverify it.

The original five-skill boundary, mandatory accessibility considerations, and single shared foundations file remain. See [EVALUATION.md](EVALUATION.md) for post-review smoke tests and their limits.

## Standards used to check accessibility guidance

The skills are not an accessibility certification tool. These primary references delimit the specific web thresholds mentioned:

- [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [Three flashes or below threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)

Native and other media need their applicable platform requirements. Measured palette contrast, a keyboard smoke test, and an attractive screenshot each establish different things; none establishes full conformance alone.

## License and redistribution notes

The original upstream notices are preserved in [licenses/](licenses/) as attribution for this synthesis and its research sources:

| Upstream | License/notice retained |
| --- | --- |
| Jakub Krehel skills | [MIT](licenses/jakub-krehel-MIT.txt), copyright 2026 Jakub Krehel |
| Emil Kowalski skills | [MIT](licenses/emil-kowalski-MIT.txt), copyright 2026 Emil Kowalski |
| Matt Pocock skills | [MIT](licenses/matt-pocock-MIT.txt), copyright Matt Pocock |
| Josh Puckett DialKit | [MIT](licenses/josh-puckett-dialkit-MIT.txt), copyright Josh Puckett |
| Impeccable | [Apache-2.0](licenses/impeccable-Apache-2.0.txt), with [earlier NOTICE](licenses/impeccable-legacy-NOTICE.md) and [current NOTICE](licenses/impeccable-current-NOTICE.md) |

The earlier Impeccable NOTICE identifies Paul Bakaus and its Anthropic frontend-design foundation. The current NOTICE identifies MIT-derived platform references from ehmo; those platform reference files are **not copied into this collection**. Both notices are retained as historical source records, not claims that all their components are bundled here.

All five `SKILL.md` files and `foundations.md` are substantially rewritten syntheses, not unmodified upstream files. No upstream code, fonts, images, videos, or paid lessons are included. Public website ideas are paraphrased and linked; repository licenses are not assumed to cover separate website prose or curriculum.

These third-party licenses govern the respective upstream material; this document does not assign a new blanket license to the surrounding project or claim endorsement. Preserve applicable notices when redistributing adaptations and choose an explicit license for your own contributions before public publication.
