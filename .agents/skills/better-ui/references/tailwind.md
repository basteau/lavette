# Tailwind

Applies to Tailwind CSS v4. Check the installed version before choosing syntax;
features in current documentation may require a newer minor release. Preserve
working configuration, plugins, tokens, and component composition conventions.

## Classes and composition

- Write complete class strings, mapping finite variants to values such as
  `{ error: "text-red-600" }`. For runtime values, use inline styles or CSS
  variables consumed by a static utility such as `bg-[var(--accent)]`.
- Reuse existing tokens; use arbitrary values for one-offs and shared tokens for
  repeated design decisions. Keep repeated UI structure and styling in components
  or template partials; use custom CSS when it expresses the requirement clearly.
- Resolve accidental conflicts while preserving intentional combinations such as
  `p-4 px-6` and breakpoint/state overrides. Class-string order does not control
  CSS precedence; use the project's existing override mechanism.

## Missing styles

Distinguish incomplete class strings, excluded source files, unsupported utilities,
and generated CSS overridden by the cascade. Inspect the generated rule before
changing specificity. When generation is missing, read
[source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files).
Check source paths relative to the stylesheet and the build's scanning base path;
register only the required sources or explicit classes. Dependencies and ignored
files may need `@source`. Confirm the real build generates the expected CSS.

## Theme and custom styles

Read the corresponding documentation when changing these definitions:

- [Theme tokens](https://tailwindcss.com/docs/theme): use `@theme` for tokens that
  expose utilities or variants, ordinary CSS variables for other values, and
  `@theme inline` when a theme token references another variable.
- [Custom utilities and variants](https://tailwindcss.com/docs/adding-custom-styles):
  use `@utility` for custom utilities that need variant support.
- [Scoped styles and directives](https://tailwindcss.com/docs/functions-and-directives):
  when separately compiled styles use `@apply` or `@variant`, use `@reference`
  to access definitions without duplicating CSS. Reference the project stylesheet
  for project-specific definitions, or `"tailwindcss"` for default definitions.
- [Dark-mode activation](https://tailwindcss.com/docs/dark-mode): follow the
  project's existing trigger when changing theme behavior.

When configuration or custom utilities change, verify their output with the
project's Tailwind build. The parent skill owns rendered-state verification.

## Setup and migration

For requested setup or build changes, read the matching
[installation guide](https://tailwindcss.com/docs/installation). New v4 setups use
`@import "tailwindcss"` and CSS-first configuration; existing `@config` integrations
can remain. For requested migrations, read the
[upgrade guide](https://tailwindcss.com/docs/upgrade-guide) and
[compatibility guide](https://tailwindcss.com/docs/compatibility), checking browser
targets, build integration, and changed visual defaults before applying changes.
