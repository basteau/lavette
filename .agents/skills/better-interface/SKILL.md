---
name: better-interface
description: Improve or review an interface when the request spans design domains or the main problem is unclear. Route to focused skills, reconcile their decisions, and verify the result.
---

# Better interface

Make fewer, better decisions. This is the default entry point, not an instruction to run every skill.

Read [foundations](references/foundations.md) before acting. Read only the domain skills selected below; their paths are relative to this file. If a file is unavailable, report the missing dependency rather than pretending to have used it.

## Process

Scale the process to the request. For a localized fix, retain the existing direction and go directly to the owning domain. Establish only missing context; do not produce a design brief or unrelated audit.

### 1. Establish the task

Inspect the provided artifact and its existing design conventions. Identify the audience, their immediate task, the relevant surface and states, and whether the user wants review, refinement, or redesign. A review produces findings, not edits. Refinement preserves identity and behavior.

Infer what the evidence supports. Ask one focused question only when an unresolved choice would materially change the work; otherwise state the consequential assumption and proceed.

**Done:** the task, scope, and useful qualities to preserve are clear.

### 2. Choose a direction

Identify what this surface primarily supports: accomplishing a task, reading, making a decision, or experiencing something expressive. Operational surfaces favor speed and stable scanning; reading surfaces favor sustained attention; persuasive surfaces need honest evidence; expressive surfaces may spend more attention on character.

When establishing or changing design direction, choose one concrete direction, not a menu of aesthetic adjectives. Example: “A quiet tool: stable numeric columns, generous group separation, and color reserved for the chosen result.” For a narrow repair or review, preserve the current direction unless evidence warrants changing it.

**Done:** the retained or proposed direction supports the task and brief.

### 3. Find the bottleneck and route

Choose the smallest set that addresses the root cause, usually one or two skills. Read them directly or invoke them through the host's supported mechanism; delegation is optional.

| Evidence or request | Read | Owns |
| --- | --- | --- |
| Everything has equal weight; gaps, grouping, density, or adaptation are inconsistent | [better-layout](../better-layout/SKILL.md) | Composition and spatial relationships |
| People must decipher labels or struggle to read and scan | [better-content](../better-content/SKILL.md) | Meaning and typographic hierarchy |
| Color, surfaces, icons, or visual emphasis feel incoherent | [better-style](../better-style/SKILL.md) | Visual treatment and contrast |
| Actions, states, focus, feedback, or motion are unclear | [better-interaction](../better-interaction/SKILL.md) | Behavior and temporal relationships |

Route by root cause, not every matching symptom. For a full audit, broad accessibility review, or new end-to-end interface, inspect all four domains: structure and reflow; meaning and text; contrast and visual cues; operation and feedback. Otherwise expand only when another domain's rules are needed. Workers do not recursively invoke this router.

**Done:** identify the selected domains and prioritize up to three problems for the next pass, each with evidence and a consequence for the task. Surface every known serious access or task-completion blocker even when there are more than three; the priority limit is not a findings limit.

### 4. Make one coherent pass

In review mode, recommend the smallest useful changes. In implementation mode, apply them using the existing platform and conventions. Resolve conflicts in the foundations' order of judgment; do not average competing visual directions.

Consolidate findings by root cause. When a shared token, component, or convention causes repeated failures, correct that source and name representative locations rather than patching each instance.

Use one direction. When comparison is requested or needed to resolve a consequential uncertainty, test one controlled alternative—not a gallery.

**Done:** every proposed or implemented change answers a priority problem; useful existing character remains.

### 5. Verify and stop

Run the selected skills' checks against the changed scope. Recheck the primary task and obvious cross-domain effects: larger text may alter layout; new colors may obscure focus; motion may delay feedback. In a review without runtime access, list the checks still needed rather than asserting they passed.

**Done:** no known critical regression is introduced, relevant evidence is recorded, and limitations are explicit. Summarize the changes or findings, checks performed, and remaining risks. Skip scores and exhaustive checklist transcripts.
