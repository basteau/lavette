---
name: better-content
description: Improve interface copy, typographic hierarchy, and readability. Use when labels are vague, messages are unhelpful, or text is difficult to scan, read, or fit.
---

# Better content

Make the meaning clear, then make its importance visible.

Read [foundations](../better-interface/references/foundations.md) unless already loaded. If unavailable, report the missing bundle dependency; use only this file's self-contained guidance and do not claim foundations were loaded. Stay within the requested scope. This skill owns language and text roles; spatial rhythm belongs to better-layout and measured color contrast to better-style.

## Process

### 1. Clarify the message

Identify what the person needs to know or decide here. Use the audience's vocabulary; keep the same term for the same concept. Put distinguishing information early in headings, labels, and lists.

Name an action by its result: “Save changes” rather than an ambiguous “Continue” when saving is what happens. Include an object when context does not make it obvious. Shorten copy by removing redundancy, not useful distinctions, conditions, or consequences.

Keep language specific and the tone appropriate to the context; use a calm voice for operational feedback. A destructive confirmation names the object and consequence. An error explains what happened and the next available step without blaming the user or inventing a cause. An empty state distinguishes “nothing yet,” “no matches,” and unavailable data, then offers a relevant next action if one exists. Loading and success messages reflect the real state.

**Done:** key labels predict behavior; consequential messages explain what the person can do next. Product claims remain supported by evidence.

### 2. Establish text roles

Reuse the existing type system. When starting fresh, begin with one family and three visual roles: heading, body, supporting. Add roles for a real information need, not to make each section look different. Semantic heading levels reflect the document structure independently of visual size.

Give adjacent roles a visible relationship and sufficient distinction. Prefer a purposeful change in size or weight over simultaneous changes in weight, case, color, and decoration. Supporting text is subordinate, not illegible.

Choose type for the actual language, glyph coverage, tone, and medium. System typography is a valid design choice. Test real text in the chosen face; nominal sizes and weights do not predict perceived size or readability across families.

Inspect short headings for awkward line endings and isolated final words. Improve wrapping where supported without hard-coded breaks that fail with translation or text enlargement.

For sustained reading, start around 45–75 characters per line and a comfortable body line height near 1.5 times the text size, then judge the actual face, script, and viewing conditions. These are defaults for suitable prose, not rules for labels, large headlines, or every writing system. Align comparable numeric values and use stable-width figures where available and useful.

**Done:** a small set of reusable roles establishes hierarchy, and important information is readable without relying on faint color or tiny type.

### 3. Protect meaning under pressure

Prefer wrapping when the complete text matters. If truncation is necessary for scanning, provide a way to recover the full meaning that works with the supported input and assistive technologies. Keep the distinguishing part visible where possible.

Retain visible labels when people need them while entering data; placeholders are examples or hints, not durable labels. Visible wording and accessible names must agree. Instructions identify the relevant control without relying only on its position, shape, or color.

Check long names, larger text, translated strings, plural forms, dates, units, and fallback glyphs relevant to the product. Preserve user text; localization and validation are not excuses to silently rewrite it.

**Done:** the content still makes sense in the longest and least comfortable supported cases.

### 4. Verify

Read the key path as a person completing the task. Check that headings support scanning, actions are distinguishable, and errors provide recovery. Inspect actual rendering when available: wrapping, clipping, missing glyphs, numeric movement, and text enlargement.

**Done:** report the important copy or role changes and the content conditions inspected. Hand color-contrast issues to better-style and flow changes to better-interaction; do not silently redesign behavior to fit shorter copy.
