<script setup lang="ts">
const mode = useColorMode();
const open = ref(false);
</script>
<template>
  <UApp>
    <UContainer class="py-12 space-y-8">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <h1 class="text-4xl font-display font-normal leading-display">A theme, at home in Nuxt.</h1>
        <UButton color="neutral" variant="outline" @click="mode.preference = mode.value === 'dark' ? 'light' : 'dark'">Switch color mode</UButton>
      </div>
      <p class="text-muted">This Nuxt app uses the extracted theme CSS and fonts with Nuxt UI’s default control sizes.</p>
      <UCard>
        <div class="space-y-6">
          <h2 class="text-2xl font-display font-normal leading-display">Your next chapter</h2>
          <div class="flex gap-3 flex-wrap">
            <UButton>Primary action</UButton><UButton color="secondary">Secondary action</UButton>
            <UButton color="neutral" variant="outline" @click="open = true">Open dialog</UButton>
          </div>
          <UFormField label="Project name"><UInput placeholder="A thoughtful starting point" /></UFormField>
          <UAlert color="success" title="Ready to make your own" description="Colors and fonts come from the downloaded package." />
          <UAlert color="warning" variant="solid" title="Review your changes" description="Solid warning labels use the exported foreground color." />
        </div>
      </UCard>
      <UModal v-model:open="open" title="An elevated surface" description="The theme also reaches portalled components.">
        <template #body><UAlert color="info" title="Everything travels together" description="Fonts and semantic colors." /></template>
      </UModal>
    </UContainer>
  </UApp>
</template>
