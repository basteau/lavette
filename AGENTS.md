# Lavette

Lavette is a browser-based OKLCH theme studio for Nuxt UI and Tailwind CSS.

- Use pnpm for dependencies and scripts; commit `pnpm-lock.yaml` with dependency changes.
- Before committing code, run `pnpm test` and `pnpm build`. The build generates Nuxt UI types before checking TypeScript.
- Use Conventional Commits: `type(scope): imperative summary`, with an optional scope. Choose `feat`, `fix`, `refactor`, `test`, `docs`, or `chore`; mark breaking changes with `!` and explain them in a `BREAKING CHANGE:` footer.
- Keep commits focused on one logical change, ordered so dependencies come first.
- For interface changes, follow [better-ui](.agents/skills/better-ui/SKILL.md), which routes to the relevant design references.
