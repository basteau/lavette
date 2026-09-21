import type { ThemeDefaults } from "@nuxt/ui";

export const UI_SIZES = ["sm", "md", "lg"] as const;
export type UiSize = typeof UI_SIZES[number];
export const UI_SIZE_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
] satisfies { label: string; value: UiSize }[];

// The same supported controls as Nuxt UI's theme studio. Components without a
// size axis (alerts, cards, tables) retain their own typography and layout.
const SIZE_COMPONENTS = [
  "button", "badge", "input", "select", "textarea", "selectMenu", "inputMenu",
  "inputNumber", "inputTags", "inputDate", "inputTime", "pinInput", "inputRating",
  "tabs", "checkbox", "checkboxGroup", "radioGroup", "switch", "slider", "stepper",
  "calendar", "colorPicker", "fileUpload", "formField", "fieldGroup",
  "dropdownMenu", "contextMenu", "commandPalette", "listbox",
] as const satisfies readonly (keyof ThemeDefaults)[];
type SizeComponent = typeof SIZE_COMPONENTS[number];

export function normalizeUiSize(value: unknown): UiSize {
  return UI_SIZES.includes(value as UiSize) ? value as UiSize : "md";
}

/** Pass to UTheme's props; explicit component size props still take priority. */
export function uiSizeProps(size: UiSize) {
  return Object.fromEntries(SIZE_COMPONENTS.map(component => [component, { size }])) as Record<SizeComponent, { size: UiSize }> satisfies ThemeDefaults;
}

/** Nuxt app.config.ts ui entry, also accepted by the Nuxt UI Vite plugin. */
export function uiSizeConfig(size: UiSize) {
  return Object.fromEntries(SIZE_COMPONENTS.map(component => [component, { defaultVariants: { size } }]));
}

export function exportSizeConfig(size: UiSize, target: "nuxt" | "vue" = "nuxt"): string {
  if (target === "vue") {
    return `// Merge this ui option into the @nuxt/ui/vite plugin in vite.config.ts.\nimport ui from '@nuxt/ui/vite';\n\nui({\n  ui: ${JSON.stringify(uiSizeConfig(size), null, 2).replace(/\n/g, "\n  ")}\n});\n`;
  }
  const entries = SIZE_COMPONENTS.map(component => `    ${component}: { defaultVariants: { size: '${size}' } },`).join("\n");
  return `// Merge into app.config.ts. Explicit component sizes take priority.\nexport default defineAppConfig({\n  ui: {\n${entries}\n  },\n});\n`;
}
