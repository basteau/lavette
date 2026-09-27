import { computed, ref, type Ref } from "vue";
import { useToast } from "@nuxt/ui/composables/useToast";
import { generatePalette, normalize, type PaletteValues } from "./palette";
import { corePaletteColors } from "./theme";

export const MAX_SAVED = 8;
const storageKey = "palette-lab-favorites-v1";
export type Saved = { id: string; values: PaletteValues };

// Every settings value passes through normalize(), so equal themes serialize identically.
const sameValues = (a: PaletteValues, b: PaletteValues) => JSON.stringify(a) === JSON.stringify(b);

/** Saved themes, kept in local storage when the browser allows it and for this visit otherwise. */
export function useCollection(values: Ref<PaletteValues>, notify: (title: string, duration?: number) => void) {
  const toast = useToast();
  const saved = ref<Saved[]>([]);
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    notify("Local storage is unavailable. Themes can still be saved for this visit.", 0);
  }
  try {
    const data = JSON.parse(stored || "[]");
    if (Array.isArray(data))
      saved.value = data
        .filter((e) => e && typeof e.id === "string")
        .slice(0, MAX_SAVED)
        .map((e) => ({ id: e.id, values: normalize(e.values) }));
  } catch { /* Unreadable saved themes are skipped. */ }

  const isSaved = computed(() => saved.value.some((s) => sameValues(s.values, values.value)));
  const swatches = computed(() =>
    Object.fromEntries(saved.value.map((entry) => [entry.id, corePaletteColors(generatePalette(entry.values), "light")])),
  );

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved.value));
    } catch {
      notify("Saved for this visit. Your browser could not write to local storage.", 0);
    }
  }
  /** Saves the current theme; returns false when it is already saved or the collection is full. */
  function save(): boolean {
    if (isSaved.value) return false;
    if (saved.value.length >= MAX_SAVED) {
      notify("Your collection is full. Remove a theme before saving another.", 0);
      return false;
    }
    saved.value.push({ id: crypto.randomUUID(), values: { ...values.value } });
    notify("Theme saved.");
    persist();
    return true;
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
          if (saved.value.length >= MAX_SAVED) return notify("Your collection is full. Remove a theme before restoring another.", 0);
          saved.value.splice(Math.min(index, saved.value.length), 0, entry);
          persist();
        },
      }],
    });
  }
  return { saved, isSaved, swatches, save, remove };
}
