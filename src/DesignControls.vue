<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { formatHex } from 'culori';
import { normalize, parseBrandColor, type PaletteValues } from './palette';
import { FONT_PAIRINGS, fontPairing } from './fonts';
const values = defineModel<PaletteValues>({ required: true });
const props = defineProps<{ brandShade: number | null }>();
const id = useId();
const sliders = computed(() => [
  { key: 'hue', label: 'Hue', max: 359, step: 1, unit: '°' },
  { key: 'character', label: 'Color character', max: 100, step: 1, unit: '', ends: ['Quiet', 'Expressive'] },
  { key: 'surfaceTone', label: 'Surface tone', max: 100, step: 1, unit: '', ends: ['Brand tint', values.value.paper === 'cool' ? 'Cool paper' : 'Warm paper'] },
  { key: 'darkDepth', label: 'Dark mode depth', max: 100, step: 1, unit: '', ends: ['Soft charcoal', 'Near black'] },
  { key: 'radius', label: 'Corner radius', max: 0.5, step: 0.025, unit: 'rem' },
] as const);
// normalize() bounds every control value, whatever the component emits.
function update(key: keyof PaletteValues, next: unknown) {
  values.value = normalize({ ...values.value, [key]: next });
}
const pairing = computed(() => fontPairing(values.value.fontPairing));
// The field keeps what the person typed until it parses; the theme only sees valid colors.
const brandDraft = ref(values.value.brandColor);
const brandError = ref('');
watch(() => values.value.brandColor, hex => { brandDraft.value = hex; brandError.value = ''; });
function commitBrand() {
  const result = parseBrandColor(brandDraft.value);
  if ('error' in result) return void (brandError.value = result.error);
  brandError.value = '';
  brandDraft.value = result.hex;
  update('brandColor', result.hex);
}
// The picker echoes any outside change back as a round-tripped hex, so it keeps its own value,
// seeded on open (near the current primary without a brand color), and commits only after a press.
const pickerColor = ref('');
const picking = ref(false);
function openPicker(open: boolean) {
  if (!open) return;
  pickerColor.value = values.value.brandColor || formatHex({ mode: 'oklch', l: 0.55, c: 0.15, h: values.value.hue });
  picking.value = false;
}
function pickBrand(hex: string | undefined) {
  if (!hex) return;
  pickerColor.value = hex;
  if (!picking.value) return;
  brandDraft.value = hex;
  commitBrand();
}
const brandHelp = computed(() => {
  const shade = props.brandShade;
  if (!values.value.brandColor) return 'Optional. Pick one, or paste a hex, rgb(), or oklch() color, to build primary around it.';
  if (shade === 700) return 'Exact at primary-700, the light mode button and link color.';
  if (shade === 300) return 'Exact at primary-300, the dark mode button and link color.';
  if (shade === null) return 'Sets primary’s hue and chroma.';
  return `Exact at primary-${shade}. Buttons use 700 in light mode and 300 in dark to stay readable.`;
});
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
    <UFormField label="Brand color" :description="brandHelp" :error="brandError || undefined">
      <UInput v-model="brandDraft" placeholder="#1f4fd8" spellcheck="false" autocomplete="off" class="w-full font-mono" :ui="{ leading: 'ps-1', trailing: 'pe-1' }" @change="commitBrand" @keydown.enter="commitBrand">
        <template #leading>
          <UPopover @update:open="openPicker">
            <UButton color="neutral" variant="ghost" size="sm" square aria-label="Pick brand color">
              <span class="brand-swatch" :style="{ background: values.brandColor || 'transparent' }" />
            </UButton>
            <template #content>
              <div class="p-2" @pointerdown.capture="picking = true">
                <UColorPicker :model-value="pickerColor" @update:model-value="pickBrand" />
              </div>
            </template>
          </UPopover>
        </template>
        <template v-if="values.brandColor" #trailing>
          <UButton icon="i-lucide-x" color="neutral" variant="link" size="sm" aria-label="Clear brand color" @click="update('brandColor', '')" />
        </template>
      </UInput>
    </UFormField>
    <div v-for="s in sliders" :key="s.key" class="slider-field">
      <div class="flex justify-between text-sm">
        <label :id="`${id}-${s.key}`">{{ s.label }}</label>
        <span v-if="s.key === 'hue' && values.brandColor" class="text-xs text-muted">From brand color</span>
        <span v-else class="font-mono text-xs text-muted">{{ values[s.key] }}{{ s.unit }}</span>
      </div>
      <USlider :model-value="values[s.key]" @update:model-value="update(s.key, $event)" :aria-labelledby="`${id}-${s.key}`" :max="s.max" :step="s.step" :disabled="s.key === 'hue' && !!values.brandColor" />
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
