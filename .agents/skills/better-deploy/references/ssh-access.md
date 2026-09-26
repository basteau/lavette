# SSH access

Use current [exe.dev docs](https://exe.dev/docs/list) for setup and troubleshooting.
These links locate instructions; read them rather than treating this file as a
cached command reference. If a link moves, find its topic in the docs index.

1. Check existing SSH configuration, available public keys, and agent identities.
   Distinguish missing credentials from network, sandbox, and host-verification
   failures. Reuse an appropriate identity; check [key selection and accounts](https://exe.dev/docs/faq/ssh-key)
   and [unexpected registration prompts](https://exe.dev/docs/faq/heisen-connect)
   before assuming the user needs a new account or key.
2. If no suitable key exists, generate a dedicated key locally using current
   [key-management guidance](https://exe.dev/docs/cli-ssh-key) and local SSH tooling.
   Preserve existing keys and configuration, keep the private key on the client
   (protected CI secret storage for automation), and register only the public key
   with the intended account.
3. With no working SSH login, use the current browser/account registration flow;
   the [account security page](https://exe.dev/user/security) is an entry point.
   An authenticated SSH key-add command cannot bootstrap its own missing access.
   If login or verification requires the user, give them the exact next step and
   public key or its path, then resume after they finish. Never request a private key.
4. Verify the host using [current host-key guidance](https://exe.dev/docs/faq/host-key),
   select the intended identity, and retry a read-only operation to confirm the
   account before deploying. Retain host-key verification and unrelated SSH settings.

If access remains unavailable, finish independent project preparation and report
what the user must complete. Do not claim deployment succeeded.
