<script setup lang="ts">
import { useId } from 'vue';
import type { PaletteValues } from './palette';
import { FONT_PAIRINGS, fontPairing } from './fonts';
import { UI_SIZE_OPTIONS } from './sizing';
const values = defineModel<PaletteValues>({ required: true });
const id = useId();
const sliders = [
  { key: 'hue', label: 'Hue', max: 359, step: 1, unit: '°' },
  { key: 'mood', label: 'Color character', max: 100, step: 1, unit: '' },
  { key: 'paperWarmth', label: 'Paper warmth', max: 100, step: 1, unit: '' },
  { key: 'radius', label: 'Corner radius', max: 0.5, step: 0.025, unit: 'rem' },
] as const;
type SliderKey = typeof sliders[number]['key'] | 'focusOffset';
function value(key: SliderKey) {
  return key === 'mood' ? Math.round((values.value.mood + values.value.depth) / 2) : values.value[key];
}
function update(key: SliderKey, next: number | number[] | undefined) {
  if (typeof next !== 'number') return;
  values.value = key === 'mood'
    ? { ...values.value, mood: next, depth: next }
    : { ...values.value, [key]: next };
}
</script>
<template>
  <div class="sidebar-controls">
    <UFormField label="Color relationship">
      <USelect v-model="values.recipe" :items="[{ label: 'Tonal', value: 'tonal' }, { label: 'Soft contrast', value: 'soft' }]" class="w-full" />
    </UFormField>
    <UFormField label="Font pairing" :description="`${fontPairing(values.fontPairing).serif} + ${fontPairing(values.fontPairing).sans}`">
      <USelect v-model="values.fontPairing" :items="FONT_PAIRINGS.map(p => ({ label: p.name, value: String(p.id) }))" class="w-full" />
    </UFormField>
    <div v-for="s in sliders" :key="s.key" class="slider-field">
      <div class="flex justify-between text-sm">
        <label :id="`${id}-${s.key}`">{{ s.label }}</label>
        <span class="font-mono text-xs text-muted">{{ value(s.key) }}{{ s.unit }}</span>
      </div>
      <USlider :model-value="value(s.key)" @update:model-value="update(s.key, $event)" :aria-labelledby="`${id}-${s.key}`" :max="s.max" :step="s.step" />
      <div v-if="s.key === 'mood' || s.key === 'paperWarmth'" class="flex justify-between text-xs text-muted">
        <span>{{ s.key === 'mood' ? 'Quiet' : 'Neutral' }}</span><span>{{ s.key === 'mood' ? 'Expressive' : 'Warm' }}</span>
      </div>
    </div>
    <details class="control-details">
      <summary>Control details</summary>
      <div class="space-y-6 pt-5">
        <UFormField label="Default control size">
          <USelect v-model="values.uiSize" :items="UI_SIZE_OPTIONS" class="w-full" />
        </UFormField>
        <UFormField label="Focus offset" :description="`${values.focusOffset}px around keyboard focus outlines`">
          <USlider :model-value="values.focusOffset" @update:model-value="update('focusOffset', $event)" :max="4" :step="1" aria-label="Focus offset" />
        </UFormField>
      </div>
    </details>
  </div>
</template>
