<script setup lang="ts">
import { useHashTarget } from "./hash";
import { computed } from "vue";
import type { Palette } from "./palette";
import { ACCENT_ROLES } from "./theme";
import { fontPairing } from "./fonts";
useHashTarget();
const props = defineProps<{ palette: Palette }>();
const pair = computed(() => fontPairing(props.palette.values.fontPairing));
const hues = computed(() => ACCENT_ROLES.map(role => ({ role, hue: Math.round(props.palette.theme.hues[role]) })));
// A fixed-lightness ring, so each dot's position reads as hue alone.
const ring = `conic-gradient(${Array.from({ length: 13 }, (_, i) => `oklch(0.78 0.11 ${i * 30}) ${i * 30}deg`).join(", ")})`;
const modes = computed(() => (["light", "dark"] as const).map(mode => {
  const checks = props.palette.theme.checks[mode];
  return { mode, failing: checks.filter(c => c.ratio < c.target).length };
}));
const total = computed(() => props.palette.theme.checks.light.length + props.palette.theme.checks.dark.length);
const passing = computed(() => total.value - modes.value.reduce((n, m) => n + m.failing, 0));
</script>
<template>
  <section id="how" class="specimen-section how-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">01 / HOW IT WORKS</div>
        <h2>Three steps to your theme file.</h2>
      </div>
    </div>
    <ol class="how-steps">
      <li class="how-step">
        <div class="how-step-head"><span class="step-number">1</span><h3>Tune the settings</h3></div>
        <p>Choose a hue and whether secondary sits beside it or opposite. Status colors shift away from your hues so they keep their meaning.</p>
        <div class="how-visual">
          <div
            class="hue-wheel"
            role="img"
            :aria-label="`Hue wheel: ${hues.map(h => `${h.role} at ${h.hue} degrees`).join(', ')}`"
          >
            <span class="hue-ring" :style="{ background: ring }" />
            <span
              v-for="h in hues"
              :key="h.role"
              class="hue-dot"
              :class="{ 'is-brand': h.role === 'primary' || h.role === 'secondary' }"
              :style="{ '--angle': `${h.hue}deg`, background: `var(--ui-${h.role})` }"
            />
          </div>
          <dl class="hue-legend">
            <div><dt><i class="bg-primary" />Primary</dt><dd>{{ hues[0]!.hue }}°</dd></div>
            <div><dt><i class="bg-secondary" />Secondary</dt><dd>{{ hues[1]!.hue }}°</dd></div>
            <div><dt>Fonts</dt><dd>{{ pair.name }}</dd></div>
          </dl>
        </div>
      </li>
      <li class="how-step">
        <div class="how-step-head"><span class="step-number">2</span><h3>Check it in real components</h3></div>
        <p>Every button, form and chart below is Nuxt UI, styled by your theme. Lavette tests text and border contrast in both modes.</p>
        <div class="how-visual how-checks">
          <div class="how-stat"><strong>{{ passing }}</strong><span>of {{ total }} contrast checks pass</span></div>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="m in modes"
              :key="m.mode"
              :color="m.failing ? 'warning' : 'success'"
              variant="subtle"
              :icon="m.failing ? 'i-lucide-triangle-alert' : 'i-lucide-check'"
              class="capitalize"
              >{{ m.failing ? `${m.mode}: ${m.failing} to review` : m.mode }}</UBadge
            >
          </div>
        </div>
      </li>
      <li class="how-step">
        <div class="how-step-head"><span class="step-number">3</span><h3>Export one CSS file</h3></div>
        <p>Import it after Nuxt UI in your main stylesheet. Fonts load from Google Fonts, so there is nothing else to install.</p>
        <div class="how-visual how-code">
          <pre class="code-block"><span class="text-dimmed">@import "@nuxt/ui";</span>
@import "./lavette-theme.css";</pre>
          <UButton to="#install" external variant="link" class="px-0" trailing-icon="i-lucide-arrow-down">See install steps</UButton>
        </div>
      </li>
    </ol>
  </section>
</template>
