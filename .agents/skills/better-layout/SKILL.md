---
name: better-layout
description: Improve interface hierarchy, grouping, vertical rhythm, density, and adaptation to available space. Use when composition is hard to scan or spacing feels arbitrary.
---

# Better layout

Make relationships visible before adding decoration.

Read [foundations](../better-interface/references/foundations.md) unless already loaded. If unavailable, report the missing bundle dependency; use only this file's self-contained guidance and do not claim foundations were loaded. Stay within the requested scope. This skill owns space and composition; text roles belong to better-content, visual treatment to better-style, and disclosure behavior to better-interaction.

## Process

### 1. Establish the reading order

Identify the primary task, important content, and next useful action. Inspect real content, not only ideal placeholders. Establish the intended order of attention for the affected scope.

Group by meaning. Related elements sit closer together than unrelated groups. Establish shared alignment edges, including alignment of labels, values, and actions. Reading order must remain meaningful when spatial arrangements change.

**Done:** each group has an identifiable purpose and the hierarchy supports the task.

### 2. Set the rhythm

Inspect existing relationships first. Where comparable gaps are arbitrary or a system is missing, choose **one minor and one major vertical-spacing unit** as working defaults, preferably from existing values. Minor connects related items; major separates meaningful groups. Reuse them rather than choosing each gap independently. Preserve purposeful relationships in a coherent existing scale.

Choose initial values in representative content, then judge grouping, reading cadence, and density across the whole surface. Do not derive them mechanically from body line height. Without rendered evidence, a proposed pair is a provisional experiment, not a validated improvement.

Use deliberate multiples of major for genuine section breaks, not an expanded menu of nearly identical tokens. At a density or viewport change, adjust the pair coherently only if needed. Text line spacing, minimum hit areas, safe areas, borders, and optical corrections are separate constraints—not reasons to invent more rhythm tokens.

Apply rhythm through the actual layout mechanism. Check effective gaps: nested containers, text metrics, and hidden elements can make nominally equal values look unequal. Optical adjustment should correct a visible mismatch, not become unrecorded drift.

**Done:** related items read as related, group boundaries are apparent, and repetition creates a coherent cadence. Reuse the pair where it supports those relationships; retain optical differences where equal values would look wrong.

### 3. Simplify the composition

Try spacing and alignment before adding a box, divider, or background. Use a container when it clarifies ownership, interaction boundaries, state, or comparison. Repeated cards are appropriate when the content really consists of comparable objects.

Let density follow the work. A monitoring tool may need many visible values; a reading surface needs comfortable measure and pauses. Preserve useful information rather than hiding it merely to appear minimal.

Adapt when content stops fitting comfortably, rather than assuming a particular device class. Allow text to wrap and regions to grow. Preserve important actions and logical order across widths, orientations, text enlargement, localization, and right-to-left presentation where supported. Use a different representation for genuinely two-dimensional data when useful; do not force every table into stacked cards.

Make overflow discoverable when content or actions continue beyond a scroll edge. Keep primary controls stable as loading indicators, messages, and real content appear.

**Done:** the surface has a clear focal point, meaningful groups, and no unnecessary structural layer.

### 4. Verify

Check the smallest supported space and a spacious one, with representative long content, sparse content, and text enlargement. For applicable web surfaces, check 200% text resizing and reflow at 320 CSS pixels separately, respecting content exceptions; use equivalent platform accessibility checks elsewhere.

Confirm that critical content and actions remain reachable, reading order survives adaptation, and repeated groups retain their rhythm. If content must truncate, coordinate access to its complete meaning with better-content.

**Done:** changed relationships remain coherent in the arrangements inspected. Report spacing values only when proposing or changing them. A screenshot alone cannot verify responsive behavior or assistive-technology reading order.
