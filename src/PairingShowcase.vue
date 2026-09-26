<script setup lang="ts">
import { computed, ref } from "vue";
import ThemeArt from "./ThemeArt.vue";
const range = ref("30d");
const series = {
  "7d": { members: [42, 48, 45, 58, 62, 60, 71], visitors: [70, 66, 78, 74, 86, 90, 88] },
  "30d": { members: [30, 34, 33, 41, 46, 44, 52, 57, 55, 63, 68, 74], visitors: [58, 62, 60, 71, 69, 76, 80, 78, 85, 83, 90, 94] },
  "90d": { members: [18, 22, 27, 26, 33, 38, 42, 47, 51, 58, 64, 72], visitors: [40, 46, 49, 55, 57, 62, 66, 70, 76, 80, 86, 92] },
} as const;
const totals = {
  "7d": { members: "1,284", visitors: "3,910", membersChange: "+9%", visitorsChange: "+4%" },
  "30d": { members: "8,420", visitors: "21,300", membersChange: "+12%", visitorsChange: "+6%" },
  "90d": { members: "24,050", visitors: "61,780", membersChange: "+31%", visitorsChange: "+18%" },
} as const;
type Range = keyof typeof series;
const W = 600, H = 200;
// A Catmull-Rom curve through each point keeps the lines soft without overshooting much.
function curve(values: readonly number[]) {
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - (v / 100) * H] as const);
  return pts.reduce((d, [x, y], i) => {
    if (!i) return `M${x},${y}`;
    const [x0, y0] = pts[i - 2] ?? pts[i - 1]!;
    const [x1, y1] = pts[i - 1]!;
    const [x3, y3] = pts[i + 1] ?? [x, y];
    return `${d} C${x1 + (x - x0) / 6},${y1 + (y - y0) / 6} ${x - (x3 - x1) / 6},${y - (y3 - y1) / 6} ${x},${y}`;
  }, "");
}
const paths = computed(() => {
  const data = series[range.value as Range];
  const members = curve(data.members), visitors = curve(data.visitors);
  return {
    members,
    visitors,
    membersArea: `${members} L${W},${H} L0,${H} Z`,
    visitorsArea: `${visitors} L${W},${H} L0,${H} Z`,
  };
});
const total = computed(() => totals[range.value as Range]);
const playing = ref(true), shuffle = ref(false), repeat = ref(false), liked = ref(true);
const position = ref(38);
const duration = 252;
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
const elapsed = computed(() => clock((position.value / 100) * duration));
const pairs = ref({ switch: true, check: true, slider: 62 });
</script>
<template>
  <section id="pairing" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">05 / PRIMARY × SECONDARY</div>
        <h2>Two colors, one voice.</h2>
      </div>
    </div>
    <UCard :ui="{ body: 'sm:p-7' }">
      <div class="pairing-chart-head">
        <div class="pairing-totals">
          <div>
            <span class="legend-key"><i class="bg-primary" />Members</span>
            <strong>{{ total.members }}</strong>
            <UBadge color="primary" variant="subtle" size="sm">{{ total.membersChange }}</UBadge>
          </div>
          <div>
            <span class="legend-key"><i class="bg-secondary" />Visitors</span>
            <strong>{{ total.visitors }}</strong>
            <UBadge color="secondary" variant="subtle" size="sm">{{ total.visitorsChange }}</UBadge>
          </div>
        </div>
        <UTabs
          v-model="range"
          :items="[
            { label: '7 days', value: '7d' },
            { label: '30 days', value: '30d' },
            { label: '90 days', value: '90d' },
          ]"
          :content="false"
          size="xs"
        />
      </div>
      <svg
        class="pairing-chart"
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="none"
        role="img"
        :aria-label="`Members and visitors over ${range.replace('d', '')} days, both rising`"
      >
        <defs>
          <linearGradient id="pairing-members" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style="stop-color: var(--ui-color-primary-400)" stop-opacity=".5" />
            <stop offset="1" style="stop-color: var(--ui-color-primary-400)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="pairing-visitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style="stop-color: var(--ui-color-secondary-300)" stop-opacity=".55" />
            <stop offset="1" style="stop-color: var(--ui-color-secondary-300)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          v-for="y in [50, 100, 150]"
          :key="y"
          :d="`M0 ${y}H${W}`"
          class="pairing-grid"
          vector-effect="non-scaling-stroke"
        />
        <path :d="paths.visitorsArea" fill="url(#pairing-visitors)" />
        <path :d="paths.membersArea" fill="url(#pairing-members)" />
        <path :d="paths.visitors" fill="none" style="stroke: var(--ui-secondary)" stroke-width="2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke" />
        <path :d="paths.members" fill="none" style="stroke: var(--ui-primary)" stroke-width="2.5" vector-effect="non-scaling-stroke" />
      </svg>
    </UCard>
    <div class="two-column stretch mt-6">
      <UCard>
        <div class="specimen-label">
          <h3>Side by side</h3>
          <code>color="primary" · color="secondary"</code>
        </div>
        <div class="pairing-matrix">
          <span />
          <span class="pairing-col">Primary</span>
          <span class="pairing-col">Secondary</span>
          <span>Solid</span>
          <UButton color="primary">Continue</UButton>
          <UButton color="secondary">Continue</UButton>
          <span>Soft</span>
          <UButton color="primary" variant="soft">Save draft</UButton>
          <UButton color="secondary" variant="soft">Save draft</UButton>
          <span>Badge</span>
          <div class="flex gap-2"><UBadge color="primary">New</UBadge><UBadge color="primary" variant="outline">Beta</UBadge></div>
          <div class="flex gap-2"><UBadge color="secondary">New</UBadge><UBadge color="secondary" variant="outline">Beta</UBadge></div>
          <span>Toggle</span>
          <USwitch v-model="pairs.switch" color="primary" aria-label="Primary switch" />
          <USwitch v-model="pairs.switch" color="secondary" aria-label="Secondary switch" />
          <span>Check</span>
          <UCheckbox v-model="pairs.check" color="primary" label="Selected" />
          <UCheckbox v-model="pairs.check" color="secondary" label="Selected" />
          <span>Slider</span>
          <USlider v-model="pairs.slider" color="primary" aria-label="Primary slider" />
          <USlider v-model="pairs.slider" color="secondary" aria-label="Secondary slider" />
        </div>
      </UCard>
      <UCard>
        <div class="specimen-label">
          <h3>Together</h3>
          <code>UProgress · UChip · UBadge</code>
        </div>
        <div class="player">
          <div class="player-cover"><ThemeArt variant="cover" /></div>
          <div class="min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="font-semibold text-highlighted truncate">Low Tide Letters</h4>
                <p class="text-sm text-muted truncate">Marin Ose · Harbour Sessions</p>
              </div>
              <UButton
                icon="i-lucide-heart"
                :color="liked ? 'secondary' : 'neutral'"
                :variant="liked ? 'soft' : 'ghost'"
                :aria-label="liked ? 'Remove from favorites' : 'Add to favorites'"
                :aria-pressed="liked"
                @click="liked = !liked"
              />
            </div>
            <div class="flex gap-2 mt-3">
              <UBadge color="primary" variant="soft">Ambient</UBadge>
              <UBadge color="secondary" variant="soft">Live</UBadge>
            </div>
          </div>
        </div>
        <USlider v-model="position" color="primary" size="sm" class="mt-6" aria-label="Playback position" />
        <div class="flex justify-between text-xs text-muted font-mono mt-2">
          <span>{{ elapsed }}</span><span>{{ clock(duration) }}</span>
        </div>
        <div class="flex items-center justify-center gap-2 mt-4">
          <UButton
            icon="i-lucide-shuffle"
            :color="shuffle ? 'secondary' : 'neutral'"
            :variant="shuffle ? 'soft' : 'ghost'"
            aria-label="Shuffle"
            :aria-pressed="shuffle"
            @click="shuffle = !shuffle"
          />
          <UButton icon="i-lucide-skip-back" color="neutral" variant="ghost" aria-label="Restart track" @click="position = 0" />
          <UButton
            :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'"
            size="xl"
            class="rounded-full"
            :aria-label="playing ? 'Pause' : 'Play'"
            @click="playing = !playing"
          />
          <UButton icon="i-lucide-skip-forward" color="neutral" variant="ghost" aria-label="Skip to end" @click="position = 100" />
          <UButton
            icon="i-lucide-repeat"
            :color="repeat ? 'secondary' : 'neutral'"
            :variant="repeat ? 'soft' : 'ghost'"
            aria-label="Repeat"
            :aria-pressed="repeat"
            @click="repeat = !repeat"
          />
        </div>
        <USeparator class="my-6" />
        <ul class="space-y-4">
          <li v-for="(track, i) in [
            { title: 'Salt & Signal', by: 'Marin Ose', color: 'primary', value: 82 },
            { title: 'Paper Lanterns', by: 'Iva Kade', color: 'secondary', value: 64 },
          ] as const" :key="track.title" class="flex items-center gap-3">
            <UChip :color="track.color" inset :show="i === 0">
              <UAvatar :alt="track.by" size="sm" />
            </UChip>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between text-sm gap-3">
                <span class="truncate">{{ track.title }}</span>
                <span class="text-muted font-mono text-xs">{{ track.value }}%</span>
              </div>
              <UProgress :model-value="track.value" :color="track.color" size="xs" class="mt-2" />
            </div>
          </li>
        </ul>
      </UCard>
    </div>
  </section>
</template>
