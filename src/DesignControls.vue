<script setup lang="ts">
import { computed, useId } from 'vue';
import { normalize, type PaletteValues } from './palette';
import { FONT_PAIRINGS, fontPairing } from './fonts';
const values = defineModel<PaletteValues>({ required: true });
const id = useId();
const sliders = computed(() => [
  { key: 'hue', label: 'Hue', max: 359, step: 1, unit: '°' },
  { key: 'character', label: 'Color character', max: 100, step: 1, unit: '', ends: ['Quiet', 'Expressive'] },
  { key: 'surfaceTone', label: 'Surface tone', max: 100, step: 1, unit: '', ends: ['Brand tint', values.value.paper === 'cool' ? 'Cool paper' : 'Warm paper'] },
  { key: 'radius', label: 'Corner radius', max: 0.5, step: 0.025, unit: 'rem' },
] as const);
// normalize() bounds every control value, whatever the component emits.
function update(key: keyof PaletteValues, next: unknown) {
  values.value = normalize({ ...values.value, [key]: next });
}
const pairing = computed(() => fontPairing(values.value.fontPairing));
</script>
<template>
  <div class="sidebar-controls">
    <UFormField label="Color relationship" :description="values.harmony === 'analogous' ? 'Secondary sits beside your hue.' : 'Secondary sits opposite your hue.'">
      <USelect :model-value="values.harmony" @update:model-value="update('harmony', $event)" :items="[{ label: 'Analogous', value: 'analogous' }, { label: 'Complementary', value: 'complementary' }]" class="w-full" />
    </UFormField>
    <UFormField label="Font pairing" :description="`${pairing.serif} + ${pairing.sans}`">
      <USelect :model-value="values.fontPairing" @update:model-value="update('fontPairing', $event)" :items="FONT_PAIRINGS.map(p => ({ label: p.name, value: String(p.id) }))" class="w-full" />
    </UFormField>
    <UFormField label="Paper" :description="values.paper === 'warm' ? 'Toned surfaces lean cream.' : 'Toned surfaces lean slate.'">
      <USelect :model-value="values.paper" @update:model-value="update('paper', $event)" :items="[{ label: 'Warm', value: 'warm' }, { label: 'Cool', value: 'cool' }]" class="w-full" />
    </UFormField>
    <div v-for="s in sliders" :key="s.key" class="slider-field">
      <div class="flex justify-between text-sm">
        <label :id="`${id}-${s.key}`">{{ s.label }}</label>
        <span class="font-mono text-xs text-muted">{{ values[s.key] }}{{ s.unit }}</span>
      </div>
      <USlider :model-value="values[s.key]" @update:model-value="update(s.key, $event)" :aria-labelledby="`${id}-${s.key}`" :max="s.max" :step="s.step" />
      <div v-if="'ends' in s" class="flex justify-between text-xs text-muted">
        <span>{{ s.ends[0] }}</span><span>{{ s.ends[1] }}</span>
      </div>
    </div>
    <details class="control-details">
      <summary>Advanced</summary>
      <div class="space-y-6 pt-5">
        <UFormField label="Focus ring offset" :description="`${values.focusOffset}px between a focused control and its outline`">
          <USlider :model-value="values.focusOffset" @update:model-value="update('focusOffset', $event)" :max="4" :step="1" aria-label="Focus ring offset" />
        </UFormField>
      </div>
    </details>
  </div>
</template>
