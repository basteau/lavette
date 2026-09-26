<script setup lang="ts">
import { useId } from "vue";
// Every fill resolves to a generated token, so each artwork repaints with the theme.
defineProps<{ variant: "landscape" | "still-life" | "cover" }>();
const id = useId();
</script>
<template>
  <svg
    v-if="variant === 'landscape'"
    class="theme-art"
    viewBox="0 0 480 340"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <pattern :id="`${id}-dots`" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" style="fill: var(--art-ink)" opacity=".14" />
      </pattern>
      <linearGradient :id="`${id}-sky`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: var(--art-sky-top)" />
        <stop offset="1" style="stop-color: var(--art-sky-bottom)" />
      </linearGradient>
      <radialGradient :id="`${id}-sun`" cx=".38" cy=".34" r=".7">
        <stop offset="0" style="stop-color: var(--ui-color-primary-300)" />
        <stop offset="1" style="stop-color: var(--ui-color-primary-500)" />
      </radialGradient>
      <clipPath :id="`${id}-arch`">
        <path d="M52 292V160a116 116 0 0 1 232 0v132Z" />
      </clipPath>
    </defs>
    <rect width="480" height="340" style="fill: var(--art-ground)" />
    <rect width="480" height="340" :fill="`url(#${id}-dots)`" />
    <g :clip-path="`url(#${id}-arch)`">
      <rect x="40" y="30" width="260" height="290" :fill="`url(#${id}-sky)`" />
      <g style="stroke: var(--ui-color-primary-300)" fill="none" opacity=".55">
        <circle cx="178" cy="196" r="72" />
        <circle cx="178" cy="196" r="92" />
        <circle cx="178" cy="196" r="114" />
      </g>
      <circle cx="178" cy="196" r="50" :fill="`url(#${id}-sun)`" />
      <path d="M40 222c34-20 70-30 104-18s62 20 98-4 50-16 58-12v132H40Z" style="fill: var(--art-hill-far)" />
      <path d="M40 252c40-24 86-10 118-2s66 4 96-18 38-12 46-8v96H40Z" style="fill: var(--art-hill-mid)" />
      <path d="M40 270c28 0 60 10 92 26s64 16 94 2 58-16 74-10v52H40Z" style="fill: var(--art-hill-near)" />
      <g style="stroke: var(--ui-color-primary-200)" stroke-width="2" stroke-linecap="round" opacity=".7">
        <path d="M150 238h56M160 246h36M168 254h20" />
      </g>
    </g>
    <path d="M40 292V160a128 128 0 0 1 256 0v132" fill="none" style="stroke: var(--art-ink)" stroke-width="1.25" />
    <circle cx="392" cy="110" r="56" style="fill: var(--ui-color-primary-500)" />
    <path d="M336 110a56 56 0 0 0 112 0Z" style="fill: var(--art-half)" />
    <circle cx="392" cy="110" r="18" style="fill: var(--art-ground)" />
    <circle cx="350" cy="236" r="18" fill="none" style="stroke: var(--art-ink)" stroke-width="1.25" />
    <path
      d="M412 214c2 16 6 20 22 22-16 2-20 6-22 22-2-16-6-20-22-22 16-2 20-6 22-22Z"
      style="fill: var(--art-ink)"
    />
    <path d="M334 276h112" style="stroke: var(--ui-color-secondary-500)" stroke-width="6" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="variant === 'still-life'"
    class="theme-art still-life"
    viewBox="0 0 480 188"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <radialGradient :id="`${id}-fruit`" cx=".35" cy=".3" r=".75">
        <stop offset="0" style="stop-color: var(--ui-color-primary-300)" />
        <stop offset="1" style="stop-color: var(--ui-color-primary-600)" />
      </radialGradient>
      <linearGradient :id="`${id}-vase`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style="stop-color: var(--ui-color-secondary-400)" />
        <stop offset="1" style="stop-color: var(--ui-color-secondary-600)" />
      </linearGradient>
    </defs>
    <rect width="480" height="188" style="fill: var(--art-ground)" />
    <circle cx="372" cy="36" r="92" style="fill: var(--art-glow)" />
    <path d="M150 164V74a58 58 0 0 1 116 0v90Z" style="fill: var(--art-arch)" />
    <rect y="160" width="480" height="28" style="fill: var(--art-table)" />
    <path d="M0 160h480" style="stroke: var(--art-ink)" opacity=".35" />
    <g fill="none" style="stroke: var(--ui-color-primary-700)" stroke-width="2" stroke-linecap="round">
      <path d="M190 104c-4-26-18-46-38-62" />
      <path d="M196 102c4-30 16-52 36-70" />
      <path d="M192 104c0-24 2-44 6-64" />
    </g>
    <g style="fill: var(--ui-color-primary-500)">
      <ellipse cx="160" cy="54" rx="16" ry="7" transform="rotate(38 160 54)" />
      <ellipse cx="222" cy="44" rx="16" ry="7" transform="rotate(-42 222 44)" />
      <ellipse cx="176" cy="72" rx="12" ry="5" transform="rotate(62 176 72)" />
    </g>
    <circle cx="198" cy="38" r="9" style="fill: var(--ui-color-secondary-300)" />
    <circle cx="232" cy="30" r="6" style="fill: var(--ui-color-primary-300)" />
    <path
      d="M180 100h28c0 10 14 16 14 36s-12 24-12 24h-32s-12-4-12-24 14-26 14-36Z"
      :fill="`url(#${id}-vase)`"
    />
    <path d="M168 128h52" style="stroke: var(--ui-color-secondary-200)" stroke-width="3" opacity=".8" />
    <ellipse cx="292" cy="162" rx="30" ry="4" style="fill: var(--art-ink)" opacity=".16" />
    <circle cx="288" cy="136" r="24" :fill="`url(#${id}-fruit)`" />
    <path d="M288 112c2-6 6-9 11-10" fill="none" style="stroke: var(--art-ink)" stroke-width="2" stroke-linecap="round" />
    <path d="M326 160a26 26 0 0 1 52 0Z" style="fill: var(--art-ink)" />
    <path d="M334 150h36" style="stroke: var(--ui-color-secondary-400)" stroke-width="2" />
    <circle cx="96" cy="146" r="14" style="fill: var(--ui-color-secondary-500)" />
    <circle cx="96" cy="146" r="5" style="fill: var(--art-ground)" />
  </svg>

  <svg v-else class="theme-art" viewBox="0 0 120 120" aria-hidden="true">
    <rect width="120" height="120" style="fill: var(--ui-color-primary-600)" />
    <circle cx="84" cy="40" r="30" style="fill: var(--ui-color-secondary-400)" />
    <path d="M54 40a30 30 0 0 0 60 0Z" style="fill: var(--ui-color-secondary-600)" />
    <g fill="none" style="stroke: var(--ui-color-primary-300)" opacity=".6">
      <circle cx="84" cy="40" r="38" />
      <circle cx="84" cy="40" r="48" />
    </g>
    <circle cx="84" cy="40" r="6" style="fill: var(--ui-color-primary-600)" />
    <path d="M0 88c20-12 40-12 60 0s40 12 60 0v32H0Z" style="fill: var(--ui-color-primary-800)" />
    <path d="M0 102c20-9 40-9 60 0s40 9 60 0v18H0Z" style="fill: var(--ui-color-secondary-300)" />
  </svg>
</template>
