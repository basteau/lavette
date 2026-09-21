---
name: better-style
description: Improve interface color, surface treatment, icon consistency, and visual character. Use when emphasis is noisy, styling is inconsistent, or contrast and state distinctions need checking.
---

# Better style

Build a visual language with few roles and clear relationships.

Read [foundations](../better-interface/references/foundations.md) unless already loaded. If unavailable, report the missing bundle dependency; use only this file's self-contained guidance and do not claim foundations were loaded. Stay within the requested scope. This skill owns appearance and measured contrast; composition belongs to better-layout and text hierarchy to better-content.

## Process

### 1. Establish the visual hierarchy

Inspect the existing identity and the task's intended focal point. Identify which treatments communicate action, selection, status, depth, or grouping, and which merely compete for attention.

Preserve distinctive choices that work. When identity is undeveloped, strengthen one characteristic already supported by the content or context rather than layering several unrelated stylistic effects. Familiar fonts, cards, gradients, and neutral palettes are not failures by themselves; judge their purpose and execution.

**Done:** name the visual emphasis to strengthen and the competing treatment to reduce, if any.

### 2. Give color a job

Reuse semantic roles and the project's color representation. Start a new system with a canvas, a surface only if needed, readable text, a quieter text role, a boundary where useful, and one accent. Add status colors only for actual states. Different names may share a value; avoid generating unused ramps.

Reserve the strongest emphasis for the current task. Selection and status remain understandable through text, shape, position, or an icon as well as color. A brand color need not be a usable text or button color without adjustment.

When constructing a palette, a perceptually organized color tool can help control lightness and intensity. Use the medium's supported color space and output gamut; no notation migration is required. Tune light and dark appearances separately rather than mechanically inverting them.

**Done:** each color role has a use, and emphasis agrees with the intended hierarchy.

### 3. Make surfaces coherent

Use a small, consistent treatment vocabulary for boundaries, corners, elevation, and icons. Let surfaces explain grouping or depth; a shadow is not required on every container. Prefer one useful separation cue before stacking border, tint, and shadow.

For nested rounded shapes, start by relating the inner corner to the outer corner minus the inset, then inspect the result. Treat this as a geometry aid, not a universal formula for every shape or border treatment. Align icons optically with the text they accompany; preserve a consistent visual weight and clear meaning. Ambiguous icons need labels.

**Done:** equivalent components look related, intentional differences signal something, and visual character survives the removal of redundant effects.

### 4. Verify the rendered pairs

Measure text against the actual background, including composited transparency and relevant states. Under WCAG 2.x, normal text needs at least 4.5:1; large text needs 3:1. “Large” means at least 18pt regular or 14pt bold—approximately 24 or 18.67 CSS pixels—not simply any heading. Relevant control-identifying boundaries and graphical information need 3:1 against adjacent colors, subject to the criterion's scope and exceptions.

These are web-standard thresholds, not universal platform certification. Use applicable platform requirements elsewhere. Perceptual contrast tools may assist tuning but do not replace a required WCAG 2.x contrast calculation.

Inspect supported themes, focus, selection, errors, disabled appearance, and high-contrast modes where applicable. Exemptions from a contrast criterion are not a reason to make useful content unnecessarily hard to perceive. On variable backgrounds, check the worst supported placement or supply a stable backing.

**Done:** record which pairs and states were measured and with what method. Unavailable values or approximate screenshot sampling remain unverified; a palette check is not whole-product accessibility conformance. Hand focus behavior and nonvisual state feedback to better-interaction.
