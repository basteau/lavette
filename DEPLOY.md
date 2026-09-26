# Deploy Lavette

Lavette is public at https://lavette.exe.xyz on the dedicated exe.dev VM
`lavette`. nginx serves the static Vite build on port 8000; exe.dev provides
HTTPS. nginx is enabled in systemd to survive reboots. No server-side secrets,
database, or user data are needed; saved themes live in browser local storage.

## Update the site

From the repository root, use native pnpm v12 (the exact version is pinned in
`package.json`), Node.js 22.12+, SSH access to exe.dev, and rsync:

```sh
git status --short
git rev-parse HEAD
# Resolve which revision/local changes to deploy before continuing.
bash scripts/deploy.sh
```

The script deploys the current working tree. It checks native pnpm and remote
directory access before building. It installs locked dependencies,
runs `pnpm test` and `pnpm build`, uploads only `dist/` to a new directory under
`/var/www/lavette/releases/`, and switches the `current` symlink under a lock.
Run one deployment at a time. Existing releases are retained for recovery.
No source code, environment files, or development server is exposed.

Verify anonymously after deployment:

```sh
curl --fail --silent --show-error https://lavette.exe.xyz/
ssh -o HostKeyAlias=exe.dev lavette.exe.xyz 'systemctl is-active nginx'
ssh exe.dev share show lavette
```

Open the site in a browser and confirm the theme controls and ZIP export work.
The response must be Lavette itself, not an exe.dev login page.

## Initial provisioning (already completed)

The VM was created with the default exeuntu image, which includes nginx and
rsync. The deployment directory belongs to the VM's `exedev` user. The checked-in
`deploy/nginx.conf` is installed at `/etc/nginx/sites-available/lavette` and linked
from `/etc/nginx/sites-enabled/lavette`. To update that configuration:

```sh
scp -o HostKeyAlias=exe.dev deploy/nginx.conf lavette.exe.xyz:/tmp/lavette-nginx.conf
ssh -o HostKeyAlias=exe.dev lavette.exe.xyz 'sudo install -m 644 /tmp/lavette-nginx.conf /etc/nginx/sites-available/lavette && sudo nginx -t && sudo systemctl reload nginx'
```

The provider settings are `ssh exe.dev share port lavette 8000` and
`ssh exe.dev share set-public lavette`. Check current `ssh exe.dev help share`
before changing them. `HostKeyAlias=exe.dev` verifies the VM against the existing
trusted exe.dev host key, since exe.dev handles SSH routing.

The initial application source is commit
`1fd78baaf249a3c632f5422b34bc4a29c30abe6d`; deployment files and the better-deploy
skill were added locally while setting up hosting.
