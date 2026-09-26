<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@nuxt/ui/composables/useToast";
const toast = useToast();
const surface = ref("bg");
const surfaces = [
  { label: "Canvas", value: "bg" },
  { label: "Muted", value: "bg-muted" },
  { label: "Elevated", value: "bg-elevated" },
  { label: "Accented", value: "bg-accented" },
];
const statuses = [
  { role: "success", label: "Success", status: "Saved", icon: "i-lucide-circle-check", title: "Changes saved", description: "Your team can see the latest version.", action: "View changes" },
  { role: "info", label: "Information", status: "Scheduled", icon: "i-lucide-info", title: "Update scheduled", description: "The next version goes live tomorrow.", action: "View schedule" },
  { role: "warning", label: "Warning", status: "Needs review", icon: "i-lucide-triangle-alert", title: "Review needed", description: "Two items need attention before release.", action: "Review items" },
  { role: "error", label: "Error", status: "Failed", icon: "i-lucide-circle-x", title: "Upload failed", description: "Your file is safe. Try uploading it again.", action: "View issue" },
] as const;
function preview(status: typeof statuses[number]) {
  toast.add({ id: "semantic-preview", color: status.role, icon: status.icon, title: status.title, description: status.description, duration: 8000 });
}
</script>
<template>
  <div class="semantic-overview mt-8">
    <div class="specimen-label flex-wrap gap-4">
      <h3>Status at a glance</h3>
      <UFormField label="Preview surface">
        <USelect v-model="surface" :items="surfaces" class="min-w-36" />
      </UFormField>
    </div>
    <div class="semantic-grid" :style="{ background: `var(--ui-${surface})` }">
      <article v-for="status in statuses" :key="status.role" class="semantic-example" :aria-label="`${status.label} examples`">
        <div class="flex items-center justify-between gap-3">
          <h4 class="font-medium text-sm m-0">{{ status.label }}</h4>
          <UIcon :name="status.icon" :class="`size-5 text-${status.role}`" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="status.role" variant="solid">{{ status.status }}</UBadge>
          <UBadge :color="status.role" variant="subtle" :icon="status.icon">{{ status.status }}</UBadge>
        </div>
        <UAlert :color="status.role" variant="soft" :icon="status.icon" :title="status.title" :description="status.description" />
        <div class="flex flex-wrap items-center gap-2">
          <UButton :color="status.role" @click="preview(status)">{{ status.action }}</UButton>
          <UButton :color="status.role" variant="link" @click="preview(status)">Show notification</UButton>
        </div>
        <div class="flex items-center gap-2 text-sm" :class="`text-${status.role}`">
          <span class="size-2 rounded-full shrink-0" :class="`bg-${status.role}`" aria-hidden="true" />
          <span>{{ status.status }}</span>
        </div>
        <UProgress :color="status.role" :model-value="status.role === 'success' ? 100 : 60" :aria-label="`${status.label} progress`" size="sm" />
      </article>
    </div>
  </div>
</template>
