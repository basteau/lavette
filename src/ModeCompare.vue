<script setup lang="ts">
import { iconPresets, type IconSet } from "./icons";
import { useHashTarget } from "./hash";
import { computed, reactive } from "vue";
const props = defineProps<{ iconSet: IconSet }>();
const icons = computed(() => iconPresets[props.iconSet].icons);
useHashTarget();
// Both panels share one state, so a change in either mode shows up in the other.
const state = reactive({ query: "", notify: true, published: false, level: 64 });
const panes = [
  { mode: "light", label: "Light mode", selector: ":root" },
  { mode: "dark", label: "Dark mode", selector: ".dark" },
] as const;
</script>
<template>
  <section id="modes" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">02 / LIGHT AND DARK</div>
        <h2>Both modes ship in the same file.</h2>
        <p>Lavette writes light tokens on <code>:root</code> and dark tokens on <code>.dark</code>. Change a control in either panel and the other one follows.</p>
      </div>
    </div>
    <div class="mode-compare">
      <div
        v-for="pane in panes"
        :key="pane.mode"
        :class="['mode-pane', pane.mode]"
        role="group"
        :aria-label="`${pane.label} preview`"
      >
        <div class="mode-pane-head">
          <span class="eyebrow uppercase">{{ pane.label }}</span><code>{{ pane.selector }}</code>
        </div>
        <div>
          <h3 class="mode-title">Weekly digest</h3>
          <p class="text-sm text-muted">Three drafts are ready for review.</p>
        </div>
        <UInput
          v-model="state.query"
          :icon="icons.search"
          placeholder="Search drafts"
          :aria-label="`Search drafts, ${pane.label.toLowerCase()}`"
          class="w-full"
        />
        <div class="flex flex-wrap gap-2">
          <UButton
            :icon="state.published ? icons.check : undefined"
            @click="state.published = !state.published"
            >{{ state.published ? "Published" : "Publish" }}</UButton
          ><UButton color="secondary" variant="soft">Preview</UButton
          ><UButton color="neutral" variant="outline">Later</UButton>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge :color="state.published ? 'success' : 'info'" variant="subtle">{{ state.published ? "Live" : "Scheduled" }}</UBadge>
          <UBadge color="warning" variant="subtle">2 to review</UBadge>
          <UBadge color="secondary" variant="outline">Newsletter</UBadge>
        </div>
        <USwitch v-model="state.notify" label="Notify the team" />
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted">Audience reached</span><span class="font-mono text-xs">{{ state.level }}%</span>
          </div>
          <USlider v-model="state.level" :aria-label="`Audience reached, ${pane.label.toLowerCase()}`" />
        </div>
        <UAlert color="error" variant="soft" :icon="icons.imageOff" title="One image failed to upload" />
      </div>
    </div>
  </section>
</template>
