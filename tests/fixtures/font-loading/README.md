# Blocked-font recovery

With `pnpm dev` running, open `/tests/fixtures/font-loading/`.
This mounts the real studio with a test-only Content Security Policy that blocks
all fonts, independent of the browser cache.

Verify that fallback text stays readable, editing and pairing changes still work,
the Google Fonts notice appears, and Copy CSS / Download CSS remain available.
The exported CSS must still name the selected pairing and Google-hosted font URLs.
The policy belongs only to this fixture; the production app permits Google fonts.
