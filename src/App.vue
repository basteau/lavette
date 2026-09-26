<script setup lang="ts">
import { computed, ref, watch, watchEffect, onUnmounted, defineAsyncComponent } from "vue";
import {
  generatePalette,
  randomValues,
  normalize,
  exportCSS,
  format,
  type PaletteValues,
} from "./palette";
import { themeStyles, fontStyles, corePaletteColors, focusStyles } from "./theme";
import { loadFontPairing, fontPairing } from "./fonts";
import DesignControls from "./DesignControls.vue";
import { useToast } from "@nuxt/ui/composables/useToast";
const Showcase = defineAsyncComponent(() => import("./Showcase.vue"));
const draftKey = "lavette-draft-v1";
const values = ref(normalize({}));
try {
  const draft = localStorage.getItem(draftKey);
  if (draft) values.value = normalize(JSON.parse(draft));
} catch { /* The studio also works without browser storage. */ }
watch(values, value => {
  try { localStorage.setItem(draftKey, JSON.stringify(value)); } catch { /* Collection saves report storage errors. */ }
}, { deep: true });
const palette = computed(() => generatePalette(values.value));
const dark = ref(false);
const settings = ref(false);
const collection = ref(false);
const exportOpen = ref(false);
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
  } catch {
    if (!stale) {
      notify("Google Fonts is unavailable. Using fallback fonts; your theme is still ready to export.", 0);
    }
  }
}, { immediate: true });
watchEffect(() => {
  style.textContent = themeStyles(palette.value) + fontStyles(values.value.fontPairing) + focusStyles;
});
onUnmounted(() => style.remove());
watchEffect(() => {
  document.documentElement.classList.toggle("dark", dark.value);
  document.documentElement.classList.toggle("light", !dark.value);
});
const core = computed(() =>
  corePaletteColors(palette.value, dark.value ? "dark" : "light"),
);
const pair = computed(() => fontPairing(values.value.fontPairing));
const sameValues = (a: PaletteValues, b: PaletteValues) =>
  JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
const isSaved = computed(() => saved.value.some((s) => sameValues(s.values, values.value)));
function shuffle() {
  values.value = randomValues(values.value);
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
function remove(entry: Saved) {
  const index = saved.value.findIndex((s) => s.id === entry.id);
  saved.value = saved.value.filter((s) => s.id !== entry.id);
  persist();
  toast.add({
    id: "theme-removed",
    title: "Theme removed.",
    duration: 5000,
    actions: [{
      label: "Undo",
      color: "neutral",
      variant: "outline",
      onClick: () => {
        if (saved.value.some((s) => sameValues(s.values, entry.values))) return;
        if (saved.value.length >= 8) return notify("Your collection is full. Remove a theme before restoring another.", 0);
        saved.value.splice(Math.min(index, saved.value.length), 0, entry);
        persist();
      },
    }],
  });
}
const savedSwatches = computed(() =>
  Object.fromEntries(saved.value.map((entry) => [entry.id, corePaletteColors(generatePalette(entry.values), "light")])),
);
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copied to clipboard.");
  } catch {
    manualCopy.value = text;
  }
}
function downloadFile(content: BlobPart, filename: string, type = "text/plain") {
  const url = URL.createObjectURL(
    new Blob([content], { type }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function download() {
  downloadFile(exportCSS(palette.value), "lavette-theme.css", "text/css");
}
</script>
<template>
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
        <DesignControls v-model="values" />
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
              Shape a theme for your next Nuxt UI project. Fine-tune the colors
              and type, try real components, then take it with you.
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
            <UIcon name="i-lucide-asterisk" class="art-star" aria-hidden="true" />
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
      :ui="{ header: 'pr-14' }"
      v-model:open="settings"
      title="Design settings"
      description="Adjust your theme. Changes appear in the preview and save automatically."
      ><template #body><DesignControls v-model="values" /></template>
    </UModal>
    <UModal
      :ui="{ header: 'pr-14' }"
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
            <UButton
              color="neutral"
              variant="ghost"
              class="flex-1 gap-3"
              @click="
                values = { ...entry.values };
                collection = false;
              "
              ><span class="saved-swatches" aria-hidden="true"
                ><span
                  v-for="c in savedSwatches[entry.id]"
                  :key="c.label"
                  :style="{ background: format(c.color) }" /></span
              ><span class="truncate capitalize">{{
                `${fontPairing(entry.values.fontPairing).name} · ${entry.values.harmony} · ${entry.values.hue}°`
              }}</span></UButton
            ><UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              aria-label="Remove saved theme"
              @click="remove(entry)"
            />
          </div>
        </div></template
      ></UModal
    >
    <UModal
      :ui="{ header: 'pr-14' }"
      v-model:open="exportOpen"
      title="Your theme, ready to use"
      description="For existing Nuxt UI 4 and Tailwind CSS 4 projects."
      ><template #body>
        <div class="space-y-6">
          <div class="export-preview">
            <span v-for="c in core" :key="c.label" :style="{ background: format(c.color) }" />
          </div>
          <p class="text-sm text-muted">{{ pair.name }} fonts and your light and dark theme, in one CSS file.</p>
          <p class="text-sm">Save as <code>lavette-theme.css</code> beside your main stylesheet. Import it after Tailwind CSS and Nuxt UI:</p>
          <pre class="code-block">@import "./lavette-theme.css";</pre>
          <p class="text-sm text-muted">Fonts load from Google. Fallback fonts are used if Google is unavailable.</p>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap gap-2 w-full">
          <UButton icon="i-lucide-copy" color="neutral" variant="outline" @click="copy(exportCSS(palette))">Copy CSS</UButton>
          <UButton icon="i-lucide-download" @click="download">Download CSS</UButton>
        </div>
      </template>
    </UModal>
    <UModal
      :ui="{ header: 'pr-14' }"
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
</template>
