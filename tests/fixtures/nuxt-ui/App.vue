<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { presets } from './presets';
import { uiSizeProps } from '../../../src/sizing';
const size = ref('md');
import { useToast } from '@nuxt/ui/composables/useToast';
const theme = ref('default');
const dark = ref(false);
const surface = ref('bg');
const modal = ref(false);
const email = ref('');
const saved = ref(false);
const invalid = ref(false);
const toast = useToast();
const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
document.head.append(stylesheet);
watch(theme, value => { stylesheet.href = `/themes/${value}.css`; }, { immediate: true });
watch(dark, value => {
  document.documentElement.classList.toggle('dark', value);
  document.documentElement.classList.toggle('light', !value);
}, { immediate: true });
onUnmounted(() => stylesheet.remove());
const roles=['primary','secondary','success','info','warning','error','neutral'];
function submit() {
  invalid.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  saved.value = !invalid.value;
  if (saved.value) toast.add({color:'success',title:'Profile saved',duration:8000});
}
</script>
<template>
  <UTheme :props="uiSizeProps(size)">
  <UApp>
    <header class="sticky top-0 z-20 bg-default border-b border-muted p-4 flex flex-wrap gap-4 items-end">
      <UFormField label="Theme example"><select v-model="theme" aria-label="Theme example" class="border border-accented rounded p-2 bg-default"><option v-for="(_, name) in presets" :key="name" :value="name">{{ name }}</option></select></UFormField>
      <UFormField label="Surface"><select v-model="surface" aria-label="Surface" class="border border-accented rounded p-2 bg-default"><option v-for="value in ['bg','bg-muted','bg-elevated','bg-accented']" :key="value">{{value}}</option></select></UFormField>
      <UFormField label="Default size"><select v-model="size" aria-label="Default size" class="border border-accented rounded p-2 bg-default"><option v-for="value in ['sm','md','lg']" :key="value">{{value}}</option></select></UFormField>
      <UButton color="neutral" variant="outline" @click="dark = !dark">{{dark ? 'Switch to light mode' : 'Switch to dark mode'}}</UButton>
      <UButton color="error" variant="outline" @click="modal = true">Open confirmation</UButton>
    </header>
    <UContainer class="py-8 space-y-6">
      <h1 class="text-3xl font-display font-normal leading-display">Exported theme compatibility</h1>
      <p class="text-muted">Real Nuxt UI components. Exact preset: {{ JSON.stringify(presets[theme]) }}.</p>
      <section v-for="role in roles" :key="role" :aria-label="role + ' examples'" class="border border-muted rounded-lg p-5 space-y-4" :style="{background:`var(--ui-${surface})`}">
        <h2 class="font-medium capitalize">{{role}}</h2>
        <div class="flex gap-3 flex-wrap">
          <UButton v-for="variant in ['solid','outline','soft','subtle','ghost','link']" :key="variant" :color="role" :variant="variant" :aria-label="role + ' ' + variant" @click="toast.add({color:role,title:role + ' notification',duration:8000})">{{variant}}</UButton>
          <UButton :color="role" disabled>Disabled</UButton><UButton :color="role" loading>Loading</UButton>
        </div>
        <div class="flex flex-wrap gap-3"><UBadge v-for="variant in ['solid','outline','soft','subtle']" :key="variant" :color="role" :variant="variant">{{ role }} {{ variant }}</UBadge></div>
        <UAlert :color="role" variant="soft" icon="i-lucide-info" :title="role + ' message'" description="Details should be readable on this tinted surface." />
        <UProgress :color="role" :model-value="65" :aria-label="role + ' progress'" />
        <UCheckbox :color="role" :default-value="true" :label="role + ' selected control'" />
      </section>
      <section class="border border-muted rounded-lg p-5 space-y-4 bg-elevated">
        <h2 class="font-medium">Form validation</h2>
        <form @submit.prevent="submit" class="space-y-4">
          <UFormField label="Email" :error="invalid ? 'Enter a valid email address.' : undefined"><UInput v-model="email" placeholder="you@example.com" /></UFormField>
          <UButton type="submit">Save profile</UButton>
        </form>
        <UAlert v-if="saved" color="success" variant="soft" title="Profile saved" />
      </section>
      <div class="grid sm:grid-cols-3 gap-4">
        <div v-for="border in ['border-muted','border','border-accented']" :key="border" class="p-5 border" :style="{borderColor:`var(--ui-${border})`,background:`var(--ui-${surface})`}">{{ border }}</div>
      </div>
    </UContainer>
    <UModal v-model:open="modal" title="Remove this example?" description="No real data will be removed.">
      <template #body><UAlert color="warning" variant="solid" icon="i-lucide-triangle-alert" title="Review this action" description="Check warning labels on a filled alert and elevated surface." /></template>
      <template #footer><UButton color="neutral" variant="outline" @click="modal = false">Cancel</UButton><UButton color="error" @click="modal = false">Remove example</UButton></template>
    </UModal>
  </UApp>
  </UTheme>
</template>
