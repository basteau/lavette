# Nuxt UI 4.11.1 icon compatibility

The Vue/Vite Icon wrapper forwards Reka's `aria-hidden="true"` attribute as a
string to Iconify, which expects a Boolean and reports a Vue development warning.
The patch consumes that attribute and forwards the equivalent Boolean, preserving
explicit false and absent values. It does not suppress warnings globally.

pnpm applies the version-pinned patch during installation. When upgrading Nuxt UI,
check whether its Vue Icon wrapper normalizes this attribute; remove the patch
when upstream includes the equivalent fix. Verify an open USelect in development
and check that its decorative indicator remains hidden from accessibility APIs.
