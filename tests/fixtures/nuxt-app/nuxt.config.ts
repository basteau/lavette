import { iconBundle } from './lavette-ui.config';
export default defineNuxtConfig({
  icon: { clientBundle: { icons: iconBundle }, provider: 'none' },
  // Block remote requests so missing client-bundled icons are visible in tests.
  routeRules: { '/**': { headers: { 'Content-Security-Policy': "connect-src 'self' ws:;" } } },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  // The exported CSS includes its Google-hosted font faces.
  ui: { fonts: false },
});
