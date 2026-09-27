<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { formatHex } from 'culori';
import { normalize, parseBrandColor, type PaletteValues } from './palette';
import { FONT_PAIRINGS, fontPairing } from './fonts';
import ControlSlider from './ControlSlider.vue';
const values = defineModel<PaletteValues>({ required: true });
const props = defineProps<{ brandShade: number | null }>();
// normalize() bounds every control value, whatever the component emits.
function update(key: keyof PaletteValues, next: unknown) {
  values.value = normalize({ ...values.value, [key]: next });
}
const pairing = computed(() => fontPairing(values.value.fontPairing));
// The field keeps what the person typed until it parses; the theme only sees valid colors.
const brandDraft = ref(values.value.brandColor);
const brandError = ref('');
// Any settings change (a commit, Shuffle, a saved theme) replaces the model, so reset from it.
watch(values, value => { brandDraft.value = value.brandColor; brandError.value = ''; });
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
  // A rejected pick (near grey) shows why, but leaves the field on the current brand color.
  const result = parseBrandColor(hex);
  if ('error' in result) return void (brandError.value = result.error);
  brandDraft.value = result.hex;
  commitBrand();
}
const brandHelp = computed(() => {
  const shade = props.brandShade;
  if (!values.value.brandColor) return 'Optional. Used exactly in primary, instead of Primary hue.';
  if (shade === 700) return 'Exact at primary-700, the light mode button and link color.';
  if (shade === 300) return 'Exact at primary-300, the dark mode button and link color.';
  if (shade === null) return 'Sets primary’s hue and vividness.';
  return `Exact at primary-${shade}. Buttons use 700 in light mode and 300 in dark to stay readable.`;
});
</script>
<template>
  <div class="sidebar-controls">
    <fieldset class="control-group">
      <legend class="eyebrow">Color</legend>
      <div class="control-group-body">
        <ControlSlider label="Primary hue" :value="values.brandColor ? 'Set by brand color' : `${Math.round(values.hue)}°`" :model-value="values.hue" @update:model-value="update('hue', $event)" :max="359" :step="1" :disabled="!!values.brandColor" />
        <UFormField label="Brand color" :description="brandHelp" :error="brandError || undefined">
          <UInput v-model="brandDraft" placeholder="Pick or paste a color" spellcheck="false" autocomplete="off" class="w-full font-mono" :ui="{ leading: 'ps-1', trailing: 'pe-1' }" @update:model-value="brandError = ''" @change="commitBrand" @keydown.enter="commitBrand">
            <template #leading>
              <UPopover @update:open="openPicker">
                <!-- UColorPicker is pointer-only, so keyboard users type into the field instead. -->
                <UButton color="neutral" variant="ghost" size="sm" square tabindex="-1" aria-label="Open color picker">
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
        <UFormField label="Secondary color">
          <USelect :model-value="values.harmony" @update:model-value="update('harmony', $event)" :items="[{ label: 'Beside primary', value: 'analogous' }, { label: 'Opposite primary', value: 'complementary' }]" class="w-full" />
        </UFormField>
        <ControlSlider label="Vividness" :value="String(values.vividness)" :model-value="values.vividness" @update:model-value="update('vividness', $event)" :max="100" :step="1" :ends="['Muted', 'Vivid']" :note="values.brandColor ? 'Primary and secondary follow your brand color; this sets the status colors.' : undefined" />
      </div>
    </fieldset>
    <fieldset class="control-group">
      <legend class="eyebrow">Surfaces</legend>
      <div class="control-group-body">
        <UFormField label="Surface tint">
          <USelect :model-value="values.surfaceTint" @update:model-value="update('surfaceTint', $event)" :items="[{ label: 'Primary hue', value: 'primary' }, { label: 'Warm paper', value: 'warm' }, { label: 'Cool slate', value: 'cool' }]" class="w-full" />
        </UFormField>
        <ControlSlider label="Tint strength" :value="String(values.tintStrength)" :model-value="values.tintStrength" @update:model-value="update('tintStrength', $event)" :max="100" :step="1" :ends="['Grey', 'Tinted']" />
        <ControlSlider label="Dark mode background" :value="String(values.darkDepth)" :model-value="values.darkDepth" @update:model-value="update('darkDepth', $event)" :max="100" :step="1" :ends="['Charcoal', 'Near black']" />
      </div>
    </fieldset>
    <fieldset class="control-group">
      <legend class="eyebrow">Type and shape</legend>
      <div class="control-group-body">
        <UFormField label="Font pairing" :description="`${pairing.serif} + ${pairing.sans}`">
          <USelect :model-value="values.fontPairing" @update:model-value="update('fontPairing', $event)" :items="FONT_PAIRINGS.map(p => ({ label: p.name, value: String(p.id) }))" class="w-full" />
        </UFormField>
        <ControlSlider label="Corner radius" :value="`${values.radius}rem`" :model-value="values.radius" @update:model-value="update('radius', $event)" :max="0.5" :step="0.025" />
      </div>
    </fieldset>
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
