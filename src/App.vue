<script setup lang="ts">
import { computed, ref, watch, watchEffect, onUnmounted, defineAsyncComponent } from "vue";
import { generatePalette, randomValues, normalize } from "./palette";
import { themeStyles, fontStyles, corePaletteColors, focusStyles, exportCSS, format } from "./theme";
import { loadFontPairing, fontPairing } from "./fonts";
import { useCollection } from "./collection";
import DesignControls from "./DesignControls.vue";
import ThemeArt from "./ThemeArt.vue";
import { useToast } from "@nuxt/ui/composables/useToast";
const Showcase = defineAsyncComponent(() => import("./Showcase.vue"));
const HowItWorks = defineAsyncComponent(() => import("./HowItWorks.vue"));
const ModeCompare = defineAsyncComponent(() => import("./ModeCompare.vue"));
const InstallGuide = defineAsyncComponent(() => import("./InstallGuide.vue"));
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
// One toast per message, so a notice never inherits another's actions or duration.
function notify(title: string, duration = 5000) {
  toast.add({ id: title, title, duration });
}
const manualCopy = ref("");
const { saved, isSaved, swatches: savedSwatches, save: saveTheme, remove } = useCollection(values, notify);
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
function shuffle() {
  values.value = randomValues(values.value);
}
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
// Opens the collection when the theme is already saved or there is no room for it.
function save() {
  if (!saveTheme()) collection.value = true;
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
        >lavette<span class="brand-caption">Theme studio for Nuxt UI</span></a
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
          :aria-label="`Collection, ${saved.length} saved`"
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
        <div class="eyebrow">Theme settings</div>
        <p class="sidebar-title">Make it yours.</p>
        <DesignControls v-model="values" :brand-shade="palette.theme.brandShade" />
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
              ['how', 'How it works', '01'],
              ['modes', 'Light and dark', '02'],
              ['colors', 'Color scales', '03'],
              ['typography', 'Typography', '04'],
              ['components', 'Components', '05'],
              ['pairing', 'Color pairing', '06'],
              ['patterns', 'In an app', '07'],
              ['tokens', 'Tokens', '08'],
              ['install', 'Install', '09'],
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
              <span class="status-dot" /> THEME GENERATOR FOR NUXT UI
            </div>
            <h1>Pick a hue. Get a whole Nuxt&nbsp;UI theme.</h1>
            <p>
              Lavette turns a hue and a font pairing into OKLCH color scales,
              light and dark tokens and matching type. Every component on this
              page is real Nuxt UI, so you see your theme before you install it.
            </p>
            <div class="flex flex-wrap gap-3 mt-7">
              <UButton
                trailing-icon="i-lucide-arrow-down"
                to="#install"
                external
                size="lg"
                >Install your theme</UButton
              ><UButton
                to="#components"
                external
                size="lg"
                color="neutral"
                variant="outline"
                >Browse components</UButton
              >
            </div>
            <p class="hero-meta">
              For Nuxt UI 4 and Tailwind CSS 4. Free and MIT licensed, with no
              account needed.
            </p>
          </div>
          <div
            class="hero-art"
            role="img"
            aria-label="Landscape artwork in your generated primary and secondary colors"
          >
            <ThemeArt variant="landscape" />
            <div class="art-caption">
              <span>LAVETTE / COLOR STUDY</span><span>001</span>
            </div>
          </div>
        </section>
        <HowItWorks :palette="palette" />
        <ModeCompare />
        <Showcase
          :palette="palette"
          :dark="dark"
          @copy="copy"
          @export="exportOpen = true"
        />
        <InstallGuide :palette="palette" @copy="copy" @download="download" />
        <footer class="page-footer">
          <span class="wordmark">lavette</span>
          <p>
            Theme studio for Nuxt UI 4 and Tailwind CSS 4. Your settings stay
            in this browser.
          </p>
          <UButton
            variant="link"
            color="neutral"
            to="https://github.com/basteau/lavette"
            target="_blank"
            icon="i-lucide-github"
            >Source on GitHub</UButton
          >
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
      ><template #body><DesignControls v-model="values" :brand-shade="palette.theme.brandShade" /></template>
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
                `${fontPairing(entry.values.fontPairing).name} · ${entry.values.harmony} · ${entry.values.brandColor || `${entry.values.hue}°`}`
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
          <pre class="code-block">@import "tailwindcss";
@import "@nuxt/ui";
@import "./lavette-theme.css";</pre>
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
