<script setup lang="ts">
import IconSetup from "./IconSetup.vue";
import { useHashTarget } from "./hash";
import { computed } from "vue";
import type { Palette } from "./palette";
import { THEME_ROLES, exportCSS } from "./theme";
import { fontPairing } from "./fonts";
useHashTarget();
const props = defineProps<{ palette: Palette }>();
const emit = defineEmits<{ copy: [text: string]; download: []; "download-icons": [] }>();
const pair = computed(() => fontPairing(props.palette.values.fontPairing));
const size = computed(() => (new Blob([exportCSS(props.palette)]).size / 1024).toFixed(1));
const stylesheet = `@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";`;
const heading = `<h1 class="font-display font-normal leading-display tracking-normal">`;
</script>
<template>
  <section id="install" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">09 / INSTALL</div>
        <h2>Add the theme to your app.</h2>
        <p>Works in Nuxt and in Vue with Vite, wherever Nuxt UI 4 and Tailwind CSS 4 are set up.</p>
      </div>
    </div>
    <div class="install-grid">
      <ol class="install-steps">
        <li>
          <span class="step-number">1</span>
          <div>
            <h3>Export the CSS file</h3>
            <p>Save <code>lavette-theme.css</code> next to your main stylesheet, for example in <code>app/assets/css/</code> in a Nuxt app.</p>
            <div class="flex flex-wrap gap-2">
              <UButton icon="i-lucide-download" @click="emit('download')">Download CSS</UButton>
              <UButton icon="i-lucide-copy" color="neutral" variant="outline" @click="emit('copy', exportCSS(palette))">Copy CSS</UButton>
            </div>
          </div>
        </li>
        <li>
          <span class="step-number">2</span>
          <div>
            <h3>Import it after Nuxt UI</h3>
            <p>The file replaces Nuxt UI's default colors, so it has to come last.</p>
            <figure class="code-file">
              <figcaption>
                <span>main.css</span>
                <UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Copy stylesheet imports" @click="emit('copy', stylesheet)" />
              </figcaption>
              <pre>{{ stylesheet }}</pre>
            </figure>
          </div>
        </li>
        <li>
          <span class="step-number">3</span>
          <div>
            <h3>Switch modes with the <code>dark</code> class</h3>
            <p>Light tokens apply by default. Dark tokens apply under <code>.dark</code>, which Nuxt UI's color mode adds to <code>&lt;html&gt;</code> for you.</p>
          </div>
        </li>
        <li>
          <span class="step-number">4</span>
          <div>
            <h3>Set headings in the display font</h3>
            <p>The file adds a <code>font-display</code> family and a matching line height to Tailwind.</p>
            <figure class="code-file">
              <figcaption>
                <span>page.vue</span>
                <UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Copy heading classes" @click="emit('copy', heading)" />
              </figcaption>
              <pre>{{ heading }}</pre>
            </figure>
          </div>
        </li>
        <li>
          <span class="step-number">5</span>
          <div>
            <h3>Apply your icon library</h3>
            <IconSetup :icon-set="palette.values.iconSet" @copy="emit('copy', $event)" @download="emit('download-icons')" />
          </div>
        </li>
      </ol>
      <UCard class="install-file" :ui="{ body: 'sm:p-7' }">
        <div class="flex items-center justify-between gap-3 mb-5">
          <span class="flex items-center gap-2 font-medium"><UIcon name="i-lucide-file-code" class="size-4 text-primary" />lavette-theme.css</span>
          <span class="font-mono text-xs text-muted">{{ size }} KB</span>
        </div>
        <ul class="install-contents">
          <li><UIcon name="i-lucide-palette" />{{ THEME_ROLES.length }} OKLCH color scales, 11 shades each</li>
          <li><UIcon name="i-lucide-sun-moon" />Surface, text and border tokens for light and dark</li>
          <li><UIcon name="i-lucide-type" />{{ pair.serif }} and {{ pair.sans }} from Google Fonts</li>
          <li><UIcon name="i-lucide-square-dashed" />Corner radius of {{ palette.values.radius }}rem</li>
        </ul>
        <USeparator class="my-5" />
        <p class="text-sm text-muted">If your site sets a Content Security Policy, allow <code>https://fonts.gstatic.com</code> in <code>font-src</code>.</p>
      </UCard>
    </div>
  </section>
</template>
