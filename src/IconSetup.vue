<script setup lang="ts">
import { computed, ref } from 'vue';
import { ICON_SETS, type IconSet } from './icons';
const props = defineProps<{ iconSet: IconSet }>();
const emit = defineEmits<{ copy: [text: string]; download: [] }>();
const target = ref('nuxt');
const name = computed(() => ICON_SETS.find(set => set.value === props.iconSet)?.label);
const command = computed(() => `pnpm add @iconify-json/${props.iconSet}`);
const appConfig = `// app/app.config.ts (Nuxt 4)
import { uiTheme } from '../lavette-ui.config';

export default defineAppConfig({ ui: uiTheme });`;
const buildConfig = computed(() => target.value === 'nuxt' ? `// nuxt.config.ts
import { iconBundle } from './lavette-ui.config';

export default defineNuxtConfig({
  icon: { clientBundle: { icons: iconBundle } },
});` : `// vite.config.ts — options for your existing ui() plugin
import ui from '@nuxt/ui/vite';
import { uiTheme, iconBundle } from './lavette-ui.config';

ui({
  ui: uiTheme,
  icon: { clientBundle: { icons: iconBundle } },
});`);
</script>
<template>
  <div class="space-y-4">
    <p class="text-sm">For {{ name }} defaults, save the configuration at your project root and install the collection.</p>
    <UButton icon="i-lucide-download" color="neutral" variant="outline" @click="emit('download')">Download icon config</UButton>
    <figure class="code-file">
      <figcaption><span>Terminal</span><UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Copy icon install command" @click="emit('copy', command)" /></figcaption>
      <pre>{{ command }}</pre>
    </figure>
    <UFormField label="Your project">
      <USelect v-model="target" :items="[{ label: 'Nuxt', value: 'nuxt' }, { label: 'Vue / Vite', value: 'vue' }]" class="w-full" />
    </UFormField>
    <p class="text-sm text-muted">Merge these entries into your existing configuration, keeping unrelated settings and overrides. Append to any existing icon bundle list.</p>
    <figure v-if="target === 'nuxt'" class="code-file">
      <figcaption><span>App configuration</span><UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Copy app icon configuration" @click="emit('copy', appConfig)" /></figcaption>
      <pre>{{ appConfig }}</pre>
    </figure>
    <figure class="code-file">
      <figcaption><span>Build configuration</span><UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Copy icon bundle configuration" @click="emit('copy', buildConfig)" /></figcaption>
      <pre>{{ buildConfig }}</pre>
    </figure>
    <p class="text-sm text-muted">Icons are bundled locally. Existing explicit icon names remain unchanged. CSS alone does not select an icon library.</p>
  </div>
</template>
