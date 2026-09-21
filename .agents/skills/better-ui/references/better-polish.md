# UI polish

Small visual details compound: nested radii, optical alignment, surfaces, and icons.
Keep the project's component library, tokens, and density. Translate implementation
examples into the target platform's idiom.

Use [better-animation](better-animation.md) for motion behavior and
[better-accessibility](better-accessibility.md) for hit areas, focus, and semantics.
Text rendering belongs to [better-typography](better-typography.md); grouping and
spacing belong to [better-layout](better-layout.md). Load those only when relevant.

## Concentric border radius

For closely nested surfaces with an even inset, start with outer radius = inner radius + padding. Independent surfaces can keep independent radius tokens. Radius, shadow and outline recipes are in [surfaces.md](better-polish/surfaces.md).

## Optical over geometric alignment

When geometric centering looks off, align optically. Check buttons with icons, play triangles, and asymmetric glyphs at render size before nudging them; the icon set may already compensate.

## Shadows for elevation, borders for structure

Where a border exists only to create depth, prefer layered transparent `box-shadow` values. Keep borders that communicate structure or state: dividers, separators and selected or focus states.

Keep elevation levels consistent: surfaces at the same depth share shadow treatment,
and higher overlays receive proportionate separation. Where shadows imply a light
source, use a coherent direction. Inspect depth on the actual background in each
theme; extra shadow layers are useful only when they improve separation.

## Image outlines

When an image edge disappears into its surface, try a subtle inset outline using the project separator token or a low-opacity neutral. Check the actual crop in each supported theme; edge-to-edge photography may need no frame.

## Match icon stroke to text weight

Match the optical weight of adjacent text. On a 24px grid, `1.5px` beside regular text and `2px` beside semibold are starting points; preserve the icon set's native stroke conventions. Sizing and RTL flipping are in [icons.md](better-polish/icons.md).

## One SVG, recolored per state

Icons use `currentColor` and take hover, selected and disabled states from CSS color and opacity, never from separate assets. Use outline/fill variants for state when the set supports them and the product uses that convention.

## Reporting

Inspect relevant rendered states and mark unrun checks as not verified. For reviews,
use [better-ui-review](better-ui-review.md) for shared severity and reporting.
