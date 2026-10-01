<script setup lang="ts">
import { iconPresets, type IconSet } from "./icons";
import { computed, onUnmounted, ref } from "vue";
import { useToast } from "@nuxt/ui/composables/useToast";
const props = defineProps<{ iconSet: IconSet }>();
const icons = computed(() => iconPresets[props.iconSet].icons);
const toast = useToast();
const sync = ref<"failed" | "pending" | "success">("failed");
const confirmDelete = ref(false);
const deleted = ref(false);
let retryTimer: ReturnType<typeof setTimeout> | undefined;
onUnmounted(() => clearTimeout(retryTimer));
function retry() {
  if (sync.value === "pending") return;
  sync.value = "pending";
  retryTimer = setTimeout(() => {
    sync.value = "success";
    toast.add({ closeIcon: icons.value.close, id: "sync-result", color: "success", icon: icons.value.success, title: "Files are in sync", description: "All 12 files are available to your team.", duration: 8000 });
  }, 800);
}
function remove() {
  deleted.value = true;
  confirmDelete.value = false;
  toast.add({ closeIcon: icons.value.close, id: "delete-result", color: "success", title: "Draft removed", description: "Use Restore draft to undo this demo action.", duration: 8000 });
}
</script>
<template>
  <UCard class="mt-6">
    <div class="specimen-label">
      <h3>A release, from warning to recovery</h3>
    </div>
    <div class="two-column">
      <div class="space-y-4">
        <UAlert color="info" variant="soft" :icon="icons.info" title="Next release: tomorrow at 09:00" description="Your team will be notified when the release is ready." />
        <UAlert color="warning" variant="soft" :icon="icons.warning" title="One unpublished draft" description="Review it before the next release, or remove it from this demo." v-if="!deleted" />
        <div class="flex flex-wrap items-center gap-3">
          <UButton v-if="!deleted" color="error" variant="outline" :icon="icons.delete" @click="confirmDelete = true">Remove draft</UButton>
          <template v-else>
            <span role="status" class="text-sm text-success">Draft removed from this demo.</span>
            <UButton color="neutral" variant="outline" @click="deleted = false">Restore draft</UButton>
          </template>
        </div>
      </div>
      <div class="bg-elevated border border-muted rounded-lg p-5 space-y-4">
        <div role="status" aria-live="polite">
          <UAlert v-if="sync === 'failed'" color="error" variant="soft" :icon="icons.cloudAlert" title="Files could not sync" description="Your edits are saved on this device. Retry to share them with your team." />
          <UAlert v-else-if="sync === 'pending'" color="info" variant="soft" :icon="icons.reload" title="Syncing your files" description="Sending the latest changes to your workspace…" />
          <UAlert v-else color="success" variant="soft" :icon="icons.success" title="Files are in sync" description="All 12 files are available to your team." />
        </div>
        <UButton v-if="sync !== 'success'" :loading="sync === 'pending'" @click="retry">{{ sync === 'pending' ? 'Syncing files' : 'Retry sync' }}</UButton>
        <UButton v-else color="neutral" variant="outline" @click="sync = 'failed'">Reset sync demo</UButton>
      </div>
    </div>
  </UCard>
  <UModal v-model:open="confirmDelete" title="Remove this draft?" description="This example only changes the demo. You can restore the draft afterward.">
    <template #body>
      <UAlert color="warning" variant="soft" :icon="icons.warning" title="The draft will leave the release" description="Published files will remain available to your team." />
    </template>
    <template #footer>
      <UButton color="neutral" variant="outline" @click="confirmDelete = false">Keep draft</UButton>
      <UButton color="error" :icon="icons.delete" @click="remove">Remove draft</UButton>
    </template>
  </UModal>
</template>
