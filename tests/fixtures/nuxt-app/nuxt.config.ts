export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  // The package supplies its own font faces and files.
  ui: { fonts: false },
});
