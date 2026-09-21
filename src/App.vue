<script setup lang="ts">
import { computed, ref, watch, watchEffect, onUnmounted } from "vue";
import {
  generatePalette,
  randomValues,
  normalize,
  exportCSS,
  format,
  type PaletteValues,
} from "./palette";
import { themeStyles, corePaletteColors, focusStyles } from "./theme";
import { loadFontPairing, FONT_PAIRINGS, fontPairing, fontAssets } from "./fonts";
import { UI_SIZE_OPTIONS, uiSizeProps, exportSizeConfig } from "./sizing";
import Showcase from "./Showcase.vue";
import { useToast } from "@nuxt/ui/composables/useToast";
const values = ref(randomValues());
const appliedFontPairing = ref(values.value.fontPairing);
const palette = computed(() => generatePalette({ ...values.value, fontPairing: appliedFontPairing.value }));
const dark = ref(false);
const settings = ref(false);
const collection = ref(false);
const exportOpen = ref(false);
const exportTarget = ref<"nuxt" | "vue">("nuxt");
const sizeDefaults = computed(() => uiSizeProps(values.value.uiSize));
const sizeConfig = computed(() => exportSizeConfig(values.value.uiSize, exportTarget.value));
const toast = useToast();
function notify(title: string, duration = 5000) {
  toast.add({ id: "studio-notice", title, duration });
}
const manualCopy = ref("");
const storageKey = "palette-lab-favorites-v1";
type Saved = { id: string; values: PaletteValues };
const saved = ref<Saved[]>([]);
try {
  const data = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(data))
    saved.value = data
      .filter((e) => e && typeof e.id === "string")
      .slice(0, 8)
      .map((e) => ({ id: e.id, values: normalize(e.values) }));
} catch {
  notify("Local storage is unavailable. Themes can still be saved for this visit.", 0);
}
const style = document.createElement("style");
style.id = "lavette-generated-theme";
document.head.append(style);
watch(() => values.value.fontPairing, async (id, _, onCleanup) => {
  let stale = false;
  onCleanup(() => { stale = true; });
  try {
    await loadFontPairing(id);
    if (!stale) appliedFontPairing.value = id;
  } catch {
    if (!stale) {
      values.value.fontPairing = appliedFontPairing.value;
      notify("Could not load this font pairing. Please try again.", 0);
    }
  }
}, { immediate: true });
watchEffect(() => {
  style.textContent = themeStyles(palette.value) + focusStyles;
});
onUnmounted(() => style.remove());
watchEffect(() => {
  document.documentElement.classList.toggle("dark", dark.value);
  document.documentElement.classList.toggle("light", !dark.value);
});
const core = computed(() =>
  corePaletteColors(palette.value, dark.value ? "dark" : "light"),
);
const pair = computed(() => fontPairing(appliedFontPairing.value));
const isSaved = computed(() =>
  saved.value.some(
    (s) => JSON.stringify(s.values) === JSON.stringify(values.value),
  ),
);
const sliders = [
  { key: "hue", label: "Hue", max: 359, step: 1 },
  { key: "mood", label: "Color character", max: 100, step: 1 },
  { key: "paperWarmth", label: "Paper warmth", max: 100, step: 1 },
  { key: "focusOffset", label: "Focus offset", max: 4, step: 1 },
  { key: "radius", label: "Corner radius", max: 0.5, step: 0.025 },
] as const;
type SliderKey = typeof sliders[number]["key"];
function sliderValue(key: SliderKey): number {
  // Old saved themes may have independently tuned mood/depth. Keep their colors
  // intact until the user changes character, then move both dimensions together.
  return key === "mood" ? Math.round((values.value.mood + values.value.depth) / 2) : values.value[key];
}
function setSliderValue(key: SliderKey, value: number | number[] | undefined) {
  if (typeof value !== "number") return;
  if (key === "mood") values.value = { ...values.value, mood: value, depth: value };
  else values.value[key] = value;
}
function shuffle() {
  values.value = { ...randomValues(), fontPairing: values.value.fontPairing, focusOffset: values.value.focusOffset, uiSize: values.value.uiSize };
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(saved.value));
  } catch {
    notify("Saved for this visit. Your browser could not write to local storage.", 0);
  }
}
function save() {
  if (isSaved.value) {
    collection.value = true;
    return;
  }
  if (saved.value.length >= 8) {
    collection.value = true;
    notify("Your collection is full. Remove a theme before saving another.", 0);
    return;
  }
  saved.value.push({ id: crypto.randomUUID(), values: { ...values.value } });
  notify("Theme saved.");
  persist();
}
const removed = ref<Saved>();
function remove(entry: Saved) {
  removed.value = entry;
  saved.value = saved.value.filter((s) => s.id !== entry.id);
  persist();
}
function undo() {
  if (removed.value && saved.value.length < 8) {
    saved.value.push(removed.value);
    removed.value = undefined;
    persist();
  }
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copied to clipboard.");
  } catch {
    manualCopy.value = text;
  }
}
function downloadFile(content: string, filename: string, type = "text/plain") {
  const url = URL.createObjectURL(
    new Blob([content], { type }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function download() {
  downloadFile(exportCSS(palette.value), "lavette-theme.css", "text/css");
}
</script>
<template>
  <UTheme :props="sizeDefaults">
  <UApp>
    <a href="#main" class="skip-link">Skip to showcase</a>
    <header class="site-header">
      <a href="#" class="wordmark" aria-label="Lavette home"
        ><span class="brand-mark"><i v-for="n in 4" :key="n" /></span
        >lavette<span class="brand-caption">a living theme studio</span></a
      >
      <div class="flex items-center gap-2">
        <UTooltip text="Switch color mode"
          ><UButton
            :icon="dark ? 'i-lucide-sun' : 'i-lucide-moon'"
            :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
            color="neutral"
            variant="ghost"
            @click="dark = !dark"
        /></UTooltip>
        <UButton
          icon="i-lucide-bookmark"
          color="neutral"
          variant="ghost"
          aria-label="Open saved themes"
          @click="collection = true"
          ><span class="desktop-label">Collection</span
          ><span>{{ saved.length }}</span></UButton
        >
        <UButton
          icon="i-lucide-download"
          aria-label="Export theme"
          @click="exportOpen = true"
          ><span class="desktop-label">Export theme</span></UButton
        >
      </div>
    </header>
    <div class="studio-layout">
      <aside class="studio-sidebar">
        <div class="eyebrow">Your design system</div>
        <h2 class="sidebar-title">Make it yours.</h2>
        <div class="sidebar-controls">
          <UFormField label="Color relationship"
            ><USelect
              v-model="values.recipe"
              :items="[
                { label: 'Tonal', value: 'tonal' },
                { label: 'Soft contrast', value: 'soft' },
              ]"
              class="w-full"
          /></UFormField>
          <UFormField
            label="Font pairing"
            :description="`${pair.serif} + ${pair.sans}`"
            ><USelect
              v-model="values.fontPairing"
              :items="
                FONT_PAIRINGS.map((p) => ({
                  label: p.name,
                  value: String(p.id),
                }))
              "
              class="w-full"
          /></UFormField>
          <UFormField label="Default control size" description="Native control sizing; reading text stays stable.">
            <USelect v-model="values.uiSize" :items="UI_SIZE_OPTIONS" class="w-full" />
          </UFormField>
          <div v-for="s in sliders" :key="s.key" class="slider-field">
            <div class="flex justify-between text-sm">
              <label :id="`label-${s.key}`">{{ s.label }}</label
              ><span class="font-mono text-xs text-muted"
                >{{ sliderValue(s.key)
                }}{{
                  s.key === "hue" ? "°" : s.key === "radius" ? "rem" : s.key === "focusOffset" ? "px" : ""
                }}</span
              >
            </div>
            <USlider
              :model-value="sliderValue(s.key)"
              @update:model-value="setSliderValue(s.key, $event)"
              :aria-labelledby="`label-${s.key}`"
              :max="s.max"
              :step="s.step"
            />
            <div v-if="s.key === 'mood' || s.key === 'paperWarmth'" class="flex justify-between text-xs text-muted">
              <span>{{ s.key === 'mood' ? 'Quiet' : 'Neutral' }}</span>
              <span>{{ s.key === 'mood' ? 'Expressive' : 'Warm' }}</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            icon="i-lucide-shuffle"
            color="neutral"
            variant="outline"
            block
            @click="shuffle"
            >Shuffle</UButton
          ><UButton
            :icon="isSaved ? 'i-lucide-check' : 'i-lucide-plus'"
            color="neutral"
            variant="outline"
            block
            @click="save"
            >{{ isSaved ? "Saved" : "Save" }}</UButton
          >
        </div>
        <USeparator class="my-7" />
        <nav aria-label="Showcase sections" class="section-nav">
          <a
            v-for="[id, label, n] in [
              ['overview', 'Overview', '01'],
              ['colors', 'Color system', '02'],
              ['typography', 'Typography', '03'],
              ['components', 'Components', '04'],
              ['patterns', 'In practice', '05'],
              ['tokens', 'Surfaces & tokens', '06'],
            ]"
            :key="id"
            :href="`#${id}`"
            ><span>{{ label }}</span
            ><span>{{ n }}</span></a
          >
        </nav>
      </aside>
      <main id="main" class="studio-main">
        <div class="mobile-controls">
          <UButton
            icon="i-lucide-sliders-horizontal"
            color="neutral"
            variant="outline"
            @click="settings = true"
            >Design settings</UButton
          ><UButton
            icon="i-lucide-shuffle"
            color="neutral"
            variant="ghost"
            @click="shuffle"
            >Shuffle</UButton
          >
        </div>
        <section id="overview" class="hero">
          <div class="hero-copy">
            <div class="eyebrow flex items-center gap-2">
              <span class="status-dot" /> THE THEME, IN ITS ELEMENT
            </div>
            <h1>A little color.<br />A whole new feeling.</h1>
            <p>
              Meet your next design system. Explore color, type, and real
              components that move together, beautifully.
            </p>
            <div class="flex flex-wrap gap-3 mt-6">
              <UButton
                trailing-icon="i-lucide-arrow-down"
                to="#components"
                external
                size="lg"
                >Explore components</UButton
              ><UButton
                color="neutral"
                variant="outline"
                size="lg"
                @click="save"
                >{{ isSaved ? "View saved theme" : "Save this theme" }}</UButton
              >
            </div>
          </div>
          <div
            class="hero-art"
            role="img"
            aria-label="Geometric artwork using your generated primary, secondary, and neutral colors"
          >
            <div class="art-circle" />
            <div class="art-arch" />
            <div class="art-dot" />
            <span class="art-star">✳</span>
            <div class="art-caption">
              <span>LAVETTE / COLOR STUDY</span><span>001</span>
            </div>
          </div>
        </section>
        <div class="core-swatches">
          <button
            v-for="c in core"
            :key="c.label"
            @click="copy(format(c.color))"
            :aria-label="`Copy ${c.label} color`"
          >
            <span
              class="core-color"
              :style="{ background: format(c.color) }"
            /><span class="flex justify-between gap-2"
              ><strong>{{ c.label }}</strong
              ><UIcon name="i-lucide-copy" class="size-3.5" /></span
            ><code>{{ c.token.replace("--ui-", "") }}</code>
          </button>
        </div>
        <Showcase
          :palette="palette"
          :dark="dark"
          @copy="copy"
          @export="exportOpen = true"
        />
        <footer class="page-footer">
          <span class="wordmark">lavette</span>
          <p>A small starting point for something distinctly yours.</p>
          <UButton
            variant="link"
            color="neutral"
            to="#overview"
            external
            trailing-icon="i-lucide-arrow-up"
            >Back to top</UButton
          >
        </footer>
      </main>
    </div>
    <UModal
      v-model:open="settings"
      title="Design settings"
      ><template #body
        ><div class="space-y-6">
          <UFormField label="Color relationship"
            ><USelect
              v-model="values.recipe"
              :items="[
                { label: 'Tonal', value: 'tonal' },
                { label: 'Soft contrast', value: 'soft' },
              ]"
              class="w-full" /></UFormField
          ><UFormField label="Font pairing"
            ><USelect
              v-model="values.fontPairing"
              :items="
                FONT_PAIRINGS.map((p) => ({
                  label: p.name,
                  value: String(p.id),
                }))
              "
              class="w-full"
          /></UFormField>
          <UFormField label="Default control size" description="Native control sizing; reading text stays stable.">
            <USelect v-model="values.uiSize" :items="UI_SIZE_OPTIONS" class="w-full" />
          </UFormField>
          <div v-for="s in sliders" :key="s.key" class="space-y-3">
            <label :id="`mobile-${s.key}`" class="flex justify-between"
              >{{ s.label }}<code>{{ sliderValue(s.key) }}{{ s.key === "focusOffset" ? "px" : s.key === "radius" ? "rem" : s.key === "hue" ? "°" : "" }}</code></label
            ><USlider
              :model-value="sliderValue(s.key)"
              @update:model-value="setSliderValue(s.key, $event)"
              :aria-labelledby="`mobile-${s.key}`"
              :max="s.max"
              :step="s.step"
            />
            <div v-if="s.key === 'mood' || s.key === 'paperWarmth'" class="flex justify-between text-xs text-muted">
              <span>{{ s.key === 'mood' ? 'Quiet' : 'Neutral' }}</span>
              <span>{{ s.key === 'mood' ? 'Expressive' : 'Warm' }}</span>
            </div>
          </div></div></template
    ></UModal>
    <UModal
      v-model:open="collection"
      title="Your collection"
      description="Up to eight themes, saved in this browser."
      ><template #body
        ><div class="space-y-4">
          <UAlert
            v-if="!saved.length"
            color="neutral"
            variant="soft"
            title="A blank canvas, for now"
            description="Save a theme you love and it will appear here."
          />
          <div
            v-for="entry in saved"
            :key="entry.id"
            class="flex items-center gap-3"
          >
            <span
              class="saved-dot"
              :style="{
                background: format(
                  generatePalette(entry.values).theme.seeds.primary,
                ),
              }"
            /><UButton
              color="neutral"
              variant="ghost"
              class="flex-1"
              @click="
                values = { ...entry.values };
                collection = false;
              "
              >{{ fontPairing(entry.values.fontPairing).name }} ·
              {{ entry.values.recipe }} · {{ entry.values.hue }}°</UButton
            ><UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              aria-label="Remove saved theme"
              @click="remove(entry)"
            />
          </div>
          <UButton v-if="removed" variant="soft" @click="undo"
            >Undo removal</UButton
          >
        </div></template
      ></UModal
    >
    <UModal
      v-model:open="exportOpen"
      title="Take your theme with you"
      ><template #body
        ><div class="space-y-5">
          <p>
            Import the stylesheet after Tailwind CSS and Nuxt UI. It includes
            all seven ramps, semantic tokens, both color modes, radius, focus offset, and your
            chosen typography.
          </p>
          <pre class="code-block">
@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";</pre>
          <div class="flex gap-3">
            <UButton icon="i-lucide-download" @click="download"
              >Download CSS</UButton
            ><UButton
              icon="i-lucide-copy"
              variant="outline"
              @click="copy(exportCSS(palette))"
              >Copy CSS</UButton
            >
          </div>
          <USeparator />
          <h3 class="font-medium">Default control size · {{ values.uiSize.toUpperCase() }}</h3>
          <p class="text-sm text-muted">The stylesheet contains colors and typography. Merge this configuration to apply your default control size; explicit component sizes still take priority.</p>
          <UFormField label="Project framework">
            <USelect v-model="exportTarget" :items="[{ label: 'Nuxt', value: 'nuxt' }, { label: 'Vue / Vite', value: 'vue' }]" />
          </UFormField>
          <details>
            <summary class="text-sm cursor-pointer">View size configuration</summary>
            <pre class="code-block mt-3 max-h-64 overflow-auto">{{ sizeConfig }}</pre>
          </details>
          <div class="flex flex-wrap gap-3">
            <UButton icon="i-lucide-download" @click="downloadFile(sizeConfig, 'lavette-ui.config.ts')">Download config</UButton>
            <UButton icon="i-lucide-copy" variant="outline" @click="copy(sizeConfig)">Copy config</UButton>
          </div>
          <USeparator />
          <h3 class="font-medium">{{ pair.name }} font files</h3>
          <p class="text-sm text-muted">
            Copy these files and their licenses into public/fonts.
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="asset in fontAssets(appliedFontPairing)"
              :key="asset.file"
              :href="`/fonts/${asset.file}`"
              download
              external
              color="neutral"
              variant="outline"
              size="xs"
              >{{ asset.family }} · {{ asset.style }}</UButton
            ><UButton
              v-for="license in [
                ...new Set(
                  fontAssets(appliedFontPairing).map((a) => a.license),
                ),
              ]"
              :key="license"
              :href="`/fonts/${license}`"
              download
              external
              color="neutral"
              variant="link"
              size="xs"
              >{{ license }}</UButton
            >
          </div>
        </div></template
      ></UModal
    >
    <UModal
      :open="!!manualCopy"
      title="Copy manually"
      description="Clipboard access is unavailable. Select and copy the text below."
      @update:open="
        (v) => {
          if (!v) manualCopy = '';
        }
      "
      ><template #body
        ><UTextarea
          :model-value="manualCopy"
          readonly
          autoresize
          :maxrows="14"
          class="w-full"
          aria-label="Text to copy" /></template
    ></UModal>
  </UApp>
  </UTheme>
</template>
