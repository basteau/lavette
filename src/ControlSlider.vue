<script setup lang="ts">
import { useId } from 'vue';
defineProps<{ label: string; value: string; max: number; step: number; ends?: readonly [string, string]; note?: string; disabled?: boolean }>();
const model = defineModel<number>({ required: true });
const id = useId();
</script>
<template>
  <div class="slider-field">
    <div class="flex justify-between text-sm">
      <label :id="`${id}-label`">{{ label }}</label>
      <span class="font-mono text-xs text-muted">{{ value }}</span>
    </div>
    <USlider v-model="model" :aria-labelledby="`${id}-label`" :aria-describedby="note ? `${id}-note` : undefined" :max="max" :step="step" :disabled="disabled" />
    <div v-if="ends" class="flex justify-between text-xs text-muted"><span>{{ ends[0] }}</span><span>{{ ends[1] }}</span></div>
    <p v-if="note" :id="`${id}-note`" class="text-xs text-muted">{{ note }}</p>
  </div>
</template>
