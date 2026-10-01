import type { NuxtUIOptions } from '@nuxt/ui/unplugin';

type UiIconRole = keyof NonNullable<NonNullable<NuxtUIOptions['ui']>['icons']>;
export const ICON_SETS = [
  { value: 'lucide', label: 'Lucide' },
  { value: 'tabler', label: 'Tabler Outline' },
  { value: 'heroicons', label: 'Heroicons Outline' },
] as const;
export type IconSet = typeof ICON_SETS[number]['value'];

// Columns are Lucide, Tabler Outline, Heroicons Outline. Names are checked
// against the installed collections in tests; no collection JSON ships here.
const roles = {
  arrowDown: ['arrow-down', 'arrow-down', 'arrow-down'],
  arrowLeft: ['arrow-left', 'arrow-left', 'arrow-left'],
  arrowRight: ['arrow-right', 'arrow-right', 'arrow-right'],
  arrowUp: ['arrow-up', 'arrow-up', 'arrow-up'],
  caution: ['circle-alert', 'alert-circle', 'exclamation-circle'],
  check: ['check', 'check', 'check'],
  chevronDoubleLeft: ['chevrons-left', 'chevrons-left', 'chevron-double-left'],
  chevronDoubleRight: ['chevrons-right', 'chevrons-right', 'chevron-double-right'],
  chevronDown: ['chevron-down', 'chevron-down', 'chevron-down'],
  chevronLeft: ['chevron-left', 'chevron-left', 'chevron-left'],
  chevronRight: ['chevron-right', 'chevron-right', 'chevron-right'],
  chevronUp: ['chevron-up', 'chevron-up', 'chevron-up'],
  close: ['x', 'x', 'x-mark'],
  copy: ['copy', 'copy', 'document-duplicate'],
  copyCheck: ['copy-check', 'copy-check', 'clipboard-document-check'],
  dark: ['moon', 'moon', 'moon'],
  drag: ['grip-vertical', 'grip-vertical', 'bars-2'],
  ellipsis: ['ellipsis', 'dots', 'ellipsis-horizontal'],
  error: ['circle-x', 'circle-x', 'x-circle'],
  external: ['arrow-up-right', 'arrow-up-right', 'arrow-up-right'],
  eye: ['eye', 'eye', 'eye'],
  eyeOff: ['eye-off', 'eye-off', 'eye-slash'],
  file: ['file', 'file', 'document'],
  folder: ['folder', 'folder', 'folder'],
  folderOpen: ['folder-open', 'folder-open', 'folder-open'],
  hash: ['hash', 'hash', 'hashtag'],
  info: ['info', 'info-circle', 'information-circle'],
  light: ['sun', 'sun', 'sun'],
  loading: ['loader-circle', 'loader-2', 'arrow-path'],
  menu: ['menu', 'menu-2', 'bars-3'],
  minus: ['minus', 'minus', 'minus'],
  panelClose: ['panel-left-close', 'layout-sidebar-left-collapse', 'arrow-left-start-on-rectangle'],
  panelOpen: ['panel-left-open', 'layout-sidebar-left-expand', 'arrow-right-end-on-rectangle'],
  plus: ['plus', 'plus', 'plus'],
  reload: ['refresh-cw', 'refresh', 'arrow-path'],
  search: ['search', 'search', 'magnifying-glass'],
  stop: ['square', 'square', 'stop'],
  star: ['star', 'star', 'star'],
  success: ['circle-check', 'circle-check', 'check-circle'],
  system: ['monitor', 'device-desktop', 'computer-desktop'],
  tip: ['lightbulb', 'bulb', 'light-bulb'],
  upload: ['upload', 'upload', 'arrow-up-tray'],
  warning: ['triangle-alert', 'alert-triangle', 'exclamation-triangle'],
} as const satisfies Record<UiIconRole, readonly [string, string, string]>;
const extras = {
  command: ['command', 'command', 'command-line'],
  heart: ['heart', 'heart', 'heart'],
  shuffle: ['shuffle', 'arrows-shuffle', 'arrows-right-left'],
  skipBack: ['skip-back', 'player-skip-back', 'backward'],
  skipForward: ['skip-forward', 'player-skip-forward', 'forward'],
  play: ['play', 'player-play', 'play'],
  pause: ['pause', 'player-pause', 'pause'],
  repeat: ['repeat', 'repeat', 'arrow-path-rounded-square'],
  imageOff: ['image-off', 'photo-off', 'photo'],
  home: ['house', 'home', 'home'],
  settings: ['settings', 'settings', 'cog-6-tooth'],
  user: ['user', 'user', 'user'],
  notification: ['bell', 'bell', 'bell'],
  calendar: ['calendar', 'calendar', 'calendar-days'],
  download: ['download', 'download', 'arrow-down-tray'],
  edit: ['pencil', 'pencil', 'pencil-square'],
  delete: ['trash-2', 'trash', 'trash'],
  mail: ['mail', 'mail', 'envelope'],
  sparkles: ['sparkles', 'sparkles', 'sparkles'],
  cloudAlert: ['cloud-alert', 'cloud-exclamation', 'exclamation-triangle'],
} as const;
function mapNames<T extends Record<string, readonly string[]>>(names: T, set: IconSet): Record<keyof T, string> {
  const column = ICON_SETS.findIndex(option => option.value === set);
  return Object.fromEntries(Object.entries(names).map(([role, variants]) => [role, `${set}:${variants[column]}`])) as Record<keyof T, string>;
}
export function normalizeIconSet(value: unknown): IconSet {
  return ICON_SETS.some(set => set.value === value) ? value as IconSet : 'lucide';
}
function preset(set: IconSet) {
  return { ui: mapNames(roles, set), icons: { ...mapNames(roles, set), ...mapNames(extras, set) } };
}
export const iconPresets = {
  lucide: preset('lucide'),
  tabler: preset('tabler'),
  heroicons: preset('heroicons'),
};
export const allPreviewIcons = [...new Set(Object.values(iconPresets).flatMap(preset => Object.values(preset.icons)))];
export const ICON_SAMPLES = ['search', 'home', 'settings', 'user', 'notification', 'calendar', 'folder', 'download', 'edit', 'delete', 'check', 'close'] as const;

/** Scoped defaults keep the studio's own controls on Lucide. */
export function previewIconProps(set: IconSet) {
  const i = iconPresets[set].ui;
  return {
    button: { loadingIcon: i.loading },
    input: { loadingIcon: i.loading },
    select: { trailingIcon: i.chevronDown, selectedIcon: i.check, loadingIcon: i.loading },
    checkbox: { icon: i.check, indeterminateIcon: i.minus },
    switch: { loadingIcon: i.loading },
    accordion: { trailingIcon: i.chevronDown },
    modal: { closeIcon: i.close },
    slideover: { closeIcon: i.close },
    alert: { closeIcon: i.close },
    dropdownMenu: { loadingIcon: i.loading, checkedIcon: i.check, externalIcon: i.external },
    pagination: { firstIcon: i.chevronDoubleLeft, prevIcon: i.chevronLeft, nextIcon: i.chevronRight, lastIcon: i.chevronDoubleRight, ellipsisIcon: i.ellipsis },
  };
}
