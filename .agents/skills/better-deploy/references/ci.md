# CI deployment

Use this path only when automation is requested. Reuse existing CI and deployment
scripts; keep CI configuration focused on triggers, credentials, and invoking the
same project workflow. Provision the target separately from recurring CI runs.

## Resolve the policy

Infer the provider from the repository. Ask only for missing choices: triggering
events, exact branches or tag patterns, target/environment, and automatic versus
manual deployment. Include path filters only when useful. Never assume a branch
name or that every push should deploy. Record the resolved policy in `DEPLOY.md`.

Distinguish branch pushes, tag pushes, and release events. A tag pattern does not
prove the tagged commit belongs to an allowed branch; check that relationship if
the policy requires it. Preserve existing checks and deployment approvals.

## Implement with current documentation

Read relevant provider docs for syntax, trigger interactions, credentials, and
serialization; use the installed/server version for self-hosted providers:

- **GitHub Actions:** [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
  and [events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows),
  plus [deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
- **GitLab CI:** [pipeline rules](https://docs.gitlab.com/ci/yaml/workflow/),
  [job rules](https://docs.gitlab.com/ci/jobs/job_rules/),
  [configuration reference](https://docs.gitlab.com/ci/yaml/),
  [SSH credentials](https://docs.gitlab.com/ci/jobs/ssh_keys/), and
  [variable scopes](https://docs.gitlab.com/ci/variables/).

Record required configuration and where to set it, scoped to the target environment
where supported. Preserve existing names; these are useful defaults, not a schema:

| Setting | Purpose | Storage |
| --- | --- | --- |
| `EXE_SSH_KEY` | Dedicated deployment private key | CI secret |
| `EXE_KNOWN_HOSTS` | Independently verified SSH host-key entries | Controlled config or CI secret |
| `EXE_HOST` | Exact tested SSH destination, including any routing username | CI variable |
| `SITE_URL` | Application URL for builds and verification, when relevant | CI variable |

Keep the SSH destination separate from the application URL. Use provider-returned
destinations; validate and quote inputs without imposing a guessed hostname format.
Align environment restrictions and secret availability with allowed branches/tags.
Fail early with named missing-setting errors before expensive builds or remote changes,
without printing values. A separate preflight job is optional.

Deploy the triggering revision or its verified build artifact, rather than fetching
a moving branch head. Pass the revision/artifact as an input to project scripts;
map provider metadata in CI rather than coupling scripts to GitHub/GitLab variables.
Make deployment depend on the project's required checks.
Serialize by deployment target, including jobs from different refs; avoid cancelling
a job midway through remote mutation and prevent stale jobs overwriting newer releases.

Use a dedicated automation identity and the narrowest supported access. Register its
public key through [SSH access](ssh-access.md); store its private key in the provider's
protected secret storage, never the repository or logs. Verify SSH host identities
using current exe.dev guidance. Keep production credentials away from untrusted
pull/merge-request code. If credentials or account login require user action, complete
the configuration and give the exact remaining setup steps.

## Verify and record

Validate the staged artifact before activation and make retries safe for the chosen
workflow, including migrations. Where practical, use an existing version endpoint or
small release marker to verify the intended revision is served; an HTTP success alone
can come from the previous release. Keep this alongside a functional application check.
Separate release directories and atomic switching remain optional. If skipping a
repeated deployment, compare the actual artifact/release identity: a commit alone may
not identify output rebuilt with different configuration.

Validate using available provider lint/validation tools. Review representative events
that should deploy and should not: matching/nonmatching branches or tags, pull/merge
requests, and manual runs when enabled. Check pipeline-level and job-level filters
together, including duplicate runs. Use an authorized CI run when feasible; do not
create a release or push a commit/tag merely to test triggers without authorization.

Record trigger-to-target mapping, script entry point, secret names, and necessary
setup in `DEPLOY.md`. Configuration is ready when validation and policy checks pass;
automation is verified only after a successful CI deployment and application check.
Report which state was reached and any remaining activation step.
