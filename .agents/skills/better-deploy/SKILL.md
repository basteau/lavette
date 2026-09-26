---
name: better-deploy
description: Deploy projects to exe.dev over SSH, manually or through GitHub/GitLab CI, with a repeatable workflow in DEPLOY.md. Use when explicitly requested.
disable-model-invocation: true
---

# Better Deploy

Use the project's tools and the simplest suitable deployment. Brief downtime is
acceptable by default; recovery procedures and uninterrupted releases are optional.

## Discover

Read project instructions, `DEPLOY.md` (or its existing equivalent), and relevant
scripts/runtime definitions. Derive commands from the project and installed tools.
For exe.dev operations, consult the [live documentation](https://exe.dev/docs.md)
([HTML index](https://exe.dev/docs/list)) and `ssh exe.dev help`, then
`ssh exe.dev help <command>` as needed. Read only relevant pages. Obtain current
syntax, capabilities, connection destinations, and URLs from those sources and live
responses rather than assuming provider defaults or copying recipes from this skill.
If SSH access is missing or fails, follow [SSH access](references/ssh-access.md).
When asked to automate deployments or change CI triggers, follow
[CI deployment](references/ci.md); otherwise keep deployment manual.

Resolve the source on every deployment. If uncommitted changes exist, ask whether
to include them or deploy a chosen commit/branch, unless already specified. Resolve
branches to exact revisions; deploying local changes need not require committing or
pushing. CI deploys its selected revision/artifact, not local uncommitted changes.
Ask questions directly and only for unresolved decisions.

## First deployment

- Default to one VM per project with a readable project-derived name. Inspect existing
  targets; ask if ownership or intent is ambiguous. Save the actual chosen target.
- Ask public versus private web access if unclear, then remember. Use the provider URL
  unless a custom domain is already configured or requested.
- Choose transfer and build location to suit the source and runtime: rsync, Git, or
  images are options, not requirements. Reuse existing deployment tooling.
- Derive production build/start commands and arrange supervision for long-running
  services to survive disconnects and reboots. Separate provisioning and initial data
  setup from recurring deployment commands.
- For databases/services, follow existing arrangements; otherwise choose the simplest
  suitable setup on the same VM. Keep persistent data and secrets outside replaceable
  code. Resolve missing secrets through the project's delivery mechanism.

## Deploy or update

Reuse the saved workflow on recurring deployments, checking relevant assumptions
still hold. Resolve a missing or ambiguous target before proceeding. Verify provider
operations against current help/docs when using them; saved commands are project
memory, not a frozen provider specification.

Transfer only the selected inputs, preserving remote secrets and persistent data,
including when using rsync deletion. Run needed dependency, build, and migration
steps in project-defined order; stop dependent steps on failure. Prepare before
interrupting the app where practical, and restart only affected services. Keep data
initialization separate from routine updates and avoid overlapping deployments.
For migrations risking data loss or compatibility, establish the needed backup or
maintenance step first; reverting code does not reverse data changes.

Verify the deployed app through its URL or a suitable worker/service check; an auth
login page alone is not success. On failure, inspect logs and use an established safe
recovery path if available, otherwise report the actual state and unresolved issue.

## Record and finish

Maintain a short, checked-in `DEPLOY.md`, reusing an existing equivalent. Record the
target and URL, any necessary first-time setup, and working deploy/verify commands
with their directories, preferably referencing project scripts. Add state, services,
secret names/locations, or recovery notes only where relevant. Never record secret
values. Use no mandatory template or empty sections.

For a deployment, done means the selected source is running, verification passes,
and the workflow is recorded. For CI setup, use the completion criteria in its
reference. Report what was configured versus actually deployed and verified.
Commit, push, and skill installation require a separate request.
