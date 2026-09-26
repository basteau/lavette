#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Deploys the current working tree; resolve intended source before running.
target=lavette.exe.xyz
pnpm --version
ssh -o BatchMode=yes -o ConnectTimeout=15 -o HostKeyAlias=exe.dev "$target" \
  'test -w /var/www/lavette && test -w /var/www/lavette/releases'

pnpm install --frozen-lockfile
pnpm test
pnpm build

release="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)-$$"
ssh -o HostKeyAlias=exe.dev "$target" "mkdir -p /var/www/lavette/releases/$release"
rsync -az -e 'ssh -o HostKeyAlias=exe.dev' dist/ "$target:/var/www/lavette/releases/$release/"
ssh -o HostKeyAlias=exe.dev "$target" "set -eu; flock -n /var/www/lavette/deploy.lock sh -c 'ln -s releases/$release /var/www/lavette/current-$release; mv -Tf /var/www/lavette/current-$release /var/www/lavette/current'"
curl --fail --silent --show-error https://lavette.exe.xyz/ | cmp dist/index.html -
printf 'Deployed %s to https://lavette.exe.xyz\n' "$release"
