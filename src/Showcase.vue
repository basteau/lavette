<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useHashTarget } from "./hash";
import SemanticOverview from "./SemanticOverview.vue";
import ServiceScenario from "./ServiceScenario.vue";
import PairingShowcase from "./PairingShowcase.vue";
import ThemeArt from "./ThemeArt.vue";
import { useToast } from "@nuxt/ui/composables/useToast";
import type { Palette } from "./palette";
import { THEME_ROLES, SHADES, corePaletteColors, format } from "./theme";
import { fontPairing } from "./fonts";
useHashTarget();
const props = defineProps<{ palette: Palette; dark: boolean }>();
const emit = defineEmits<{ copy: [text: string]; export: [] }>();
const pair = computed(() => fontPairing(props.palette.values.fontPairing));
const core = computed(() => corePaletteColors(props.palette, props.dark ? "dark" : "light"));
// The last button pressed in the Actions card, as the markup that renders it.
const snippet = ref("");
const variants = [
  "solid",
  "outline",
  "soft",
  "subtle",
  "ghost",
  "link",
] as const;
const feedbackVariant = ref<"soft" | "subtle" | "outline" | "solid">("soft");
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const check = ref(true),
  notifications = ref(true),
  volume = ref(64),
  radio = ref("comfortable");
const tab = ref("profile"),
  search = ref(""),
  page = ref(1),
  modal = ref(false),
  drawer = ref(false);
const form = reactive({
  name: "Alex Morgan",
  email: "",
  role: "Designer",
  bio: "Making thoughtful things for the everyday.",
});
const toast = useToast();
const submitted = ref(false),
  formMessage = ref("");
const validate = (state: typeof form) => [
  ...(!state.name.trim()
    ? [{ name: "name", message: "Enter your name." }]
    : []),
  ...(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)
    ? [{ name: "email", message: "Enter a valid email address." }]
    : []),
];
watch(form, () => { submitted.value = false; });
function submit() {
  submitted.value = true;
  formMessage.value = "Profile saved. Your example changes are ready.";
  toast.add({ id: "profile-saved", color: "success", title: "Profile saved", icon: "i-lucide-circle-check", duration: 8000 });
}
const activity = ref("");
const rows = [
  {
    name: "Brand foundations",
    owner: "Alex Morgan",
    initials: "AM",
    status: "In progress",
    color: "info",
    date: "Jun 24",
    progress: 72,
  },
  {
    name: "Component library",
    owner: "Jamie Chen",
    initials: "JC",
    status: "In review",
    color: "warning",
    date: "Jun 26",
    progress: 90,
  },
  {
    name: "Product guidelines",
    owner: "Sam Rivera",
    initials: "SR",
    status: "Complete",
    color: "success",
    date: "Jun 28",
    progress: 100,
  },
  {
    name: "Website direction",
    owner: "Riley Park",
    initials: "RP",
    status: "Blocked",
    color: "error",
    date: "Jul 02",
    progress: 38,
  },
  {
    name: "Motion principles",
    owner: "Alex Morgan",
    initials: "AM",
    status: "Planned",
    color: "neutral",
    date: "Jul 04",
    progress: 12,
  },
  {
    name: "Accessibility review",
    owner: "Jamie Chen",
    initials: "JC",
    status: "Planned",
    color: "neutral",
    date: "Jul 06",
    progress: 0,
  },
] as const;
const filtered = computed(() =>
  rows.filter((r) =>
    `${r.name} ${r.owner} ${r.status}`
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  ),
);
const columns = [
  { accessorKey: "name", header: "Project" },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "progress", header: "Progress" },
  { accessorKey: "date", header: "Due date" },
];
const faq = [
  {
    label: "Are these real Nuxt UI components?",
    content:
      "Yes. Buttons, forms, tabs, tables, overlays, and every other UI specimen are rendered by @nuxt/ui in Vue. The generated CSS variables style the actual library components.",
  },
  {
    label: "What changes when I shuffle a theme?",
    content:
      "Shuffle picks a new primary hue, secondary color, vividness, and surface tint, and clears any brand color. Your font pairing, corner radius, dark mode background, and focus offset stay. Status colors keep their meaning and step aside when your primary hue comes close.",
  },
  {
    label: "How do I use this theme in my project?",
    content:
      "Download or copy the theme CSS and import it after Tailwind CSS and Nuxt UI. Your selected fonts load from Google automatically.",
  },
];
const surfaceTokens = [
  "bg",
  "bg-muted",
  "bg-elevated",
  "bg-accented",
  "bg-inverted",
];
const checkedPairs = computed(
  () => props.palette.theme.checks[props.dark ? "dark" : "light"],
);
const passes = computed(() =>
  checkedPairs.value.every((c) => c.ratio >= c.target),
);
</script>
<template>
  <section id="colors" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">03 / COLOR SCALES</div>
        <h2>Seven color scales from one hue.</h2>
        <p>Primary uses your hue exactly, or holds your brand color on its nearest shade. Status colors stay in their usual hue ranges. Click a swatch to copy its CSS variable.</p>
      </div>
      <UBadge color="neutral" variant="outline">OKLCH · sRGB</UBadge>
    </div>
    <div class="core-swatches">
      <button
        v-for="c in core"
        :key="c.label"
        @click="emit('copy', `var(${c.token})`)"
        :aria-label="`Copy ${c.label} variable`"
      >
        <span
          class="core-color"
          :style="{ background: format(c.color) }"
        /><span class="flex justify-between gap-2"
          ><strong>{{ c.label }}</strong
          ><UIcon name="i-lucide-copy" class="size-3.5" /></span
        ><code>{{ c.token }}</code>
      </button>
    </div>
    <div class="palette-table">
      <div v-for="role in THEME_ROLES" :key="role" class="palette-row">
        <div class="palette-label">
          {{ role }}
        </div>
        <div class="ramp">
          <button
            v-for="shade in SHADES"
            :key="shade"
            :aria-label="`Copy ${role} ${shade} token`"
            @click="emit('copy', `var(--ui-color-${role}-${shade})`)"
          >
            <span
              :style="{ background: `var(--ui-color-${role}-${shade})` }"
            /><code>{{ shade }}</code>
          </button>
        </div>
      </div>
    </div>
    <SemanticOverview />
  </section>
  <section id="typography" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">04 / TYPOGRAPHY</div>
        <h2>{{ pair.serif }} for headings, {{ pair.sans }} for text.</h2>
        <p>{{ pair.description }}</p>
      </div>
      <UBadge color="neutral" variant="outline">{{ pair.name }} pairing</UBadge>
    </div>
    <div class="type-grid">
      <div class="type-display">
        <span class="eyebrow">{{ pair.serif }} / DISPLAY</span>
        <div class="type-glyph">Aa<span>&</span></div>
        <h3>Ideas deserve<br /><em>beautiful expression.</em></h3>
        <p class="text-sm text-muted mt-5">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz ·
          0123456789
        </p>
      </div>
      <div class="type-body">
        <span class="eyebrow">{{ pair.sans }} / INTERFACE & BODY</span>
        <h3>Clarity in every detail.</h3>
        <p>
          Thoughtful design makes room for the things that matter. A clear
          hierarchy, a comfortable rhythm, and a voice that feels unmistakably
          yours.
        </p>
        <USeparator class="my-6" />
        <div class="type-scale">
          <div>
            <span>Heading</span
            ><strong class="text-2xl">The shape of things</strong>
          </div>
          <div><span>Body</span><span>Made for everyday reading.</span></div>
          <div>
            <span>Label</span
            ><strong class="text-sm">Small details, considered.</strong>
          </div>
          <div>
            <span>Mono</span
            ><code class="text-sm">const feeling = 'just right'</code>
          </div>
        </div>
        <div class="flex gap-2 mt-7">
          <UBadge color="neutral" variant="soft">Google Fonts</UBadge
          ><UBadge color="neutral" variant="soft">Open Font License</UBadge>
        </div>
      </div>
    </div>
  </section>
  <section id="components" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">05 / COMPONENTS</div>
        <h2>Real Nuxt UI components, styled live.</h2>
        <p>Nothing here is a mockup. Press a button to see the code that renders it.</p>
      </div>
    </div>
    <UCard class="mb-6" :ui="{ body: 'sm:p-7' }"
      ><div class="specimen-label">
        <h3>Actions</h3>
        <code>UButton · UTooltip · UDropdownMenu</code>
      </div>
      <div class="button-matrix">
        <div v-for="role in THEME_ROLES" :key="role" class="button-row">
          <span class="capitalize text-sm text-muted">{{ role }}</span
          ><UButton
            v-for="variant in variants"
            :key="variant"
            :color="role"
            :variant="variant"
            :aria-label="`${role} ${variant} button`"
            @click="snippet = `<UButton color=&quot;${role}&quot; variant=&quot;${variant}&quot;>${variant}</UButton>`"
            >{{ variant }}</UButton
          >
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 mt-5">
        <UButton color="success" disabled>Already saved</UButton>
        <UButton color="info" loading>Uploading</UButton>
        <UButton color="warning" variant="soft" disabled>Review unavailable</UButton>
        <UButton color="error" loading>Retrying</UButton>
      </div>
      <USeparator class="my-6" />
      <div class="flex flex-wrap items-center gap-3">
        <UButton
          v-for="size in sizes"
          :key="size"
          :size="size"
          @click="snippet = `<UButton size=&quot;${size}&quot;>${size.toUpperCase()}</UButton>`"
          >{{ size.toUpperCase() }}</UButton
        ><UButton disabled>Disabled</UButton><UButton loading>Loading</UButton
        ><UTooltip text="Tooltip"
          ><UButton
            icon="i-lucide-info"
            color="neutral"
            variant="outline"
            aria-label="Show tooltip" /></UTooltip
        ><UDropdownMenu
          :items="[
            {
              label: 'Duplicate specimen',
              icon: 'i-lucide-copy',
              onSelect: () => (activity = 'Specimen duplicated in this demo.'),
            },
            {
              label: 'Export theme',
              icon: 'i-lucide-download',
              onSelect: () => emit('export'),
            },
          ]"
          ><UButton
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            >More actions</UButton
          ></UDropdownMenu
        >
      </div>
      <div class="snippet" role="status">
        <code v-if="snippet">{{ snippet }}</code
        ><span v-else class="text-muted">Press a button above to see its code.</span
        ><UButton
          v-if="snippet"
          icon="i-lucide-copy"
          size="xs"
          color="neutral"
          variant="ghost"
          aria-label="Copy button code"
          @click="emit('copy', snippet)"
        />
      </div>
      <p v-if="activity" role="status" class="text-sm text-muted mt-4">
        {{ activity }}
      </p></UCard
    >
    <div class="two-column stretch">
      <UCard
        ><div class="specimen-label">
          <h3>Forms</h3>
          <code>UForm · UInput · USelect</code>
        </div>
        <UTabs
          v-model="tab"
          :items="[
            { label: 'Profile', value: 'profile', slot: 'profile' },
            { label: 'Preferences', value: 'preferences', slot: 'preferences' },
          ]"
          class="w-full"
          ><template #profile
            ><UForm
              :state="form"
              :validate="validate"
              class="space-y-5 pt-5"
              @submit="submit"
              ><UFormField label="Full name" name="name" required
                ><UInput
                  v-model="form.name"
                  icon="i-lucide-user"
                  class="w-full" /></UFormField
              ><UFormField
                label="Email address"
                name="email"
                required
                ><UInput
                  v-model="form.email"
                  placeholder="alex@studio.design"
                  icon="i-lucide-mail"
                  class="w-full" /></UFormField
              ><UFormField label="Your role" name="role"
                ><USelect
                  v-model="form.role"
                  :items="['Designer', 'Developer', 'Founder']"
                  class="w-full" /></UFormField
              ><UFormField label="About you" name="bio"
                ><UTextarea v-model="form.bio" class="w-full" :rows="3"
              /></UFormField>
              <div class="flex items-center justify-between gap-3">
                <UCheckbox
                  v-model="check"
                  label="Keep me in the loop"
                /><UButton type="submit" trailing-icon="i-lucide-arrow-right"
                  >Save profile</UButton
                >
              </div>
              <UAlert
                v-if="submitted"
                color="success"
                variant="soft"
                :title="formMessage"
                icon="i-lucide-circle-check" /></UForm></template
          ><template #preferences
            ><div class="space-y-7 py-5">
              <USwitch
                v-model="notifications"
                label="Email notifications"
                description="A summary of activity in your studio."
              /><UFormField label="Workspace density"
                ><URadioGroup
                  v-model="radio"
                  :items="['comfortable', 'compact']" /></UFormField
              ><UFormField :label="`Notification volume · ${volume}%`"
                ><USlider
                  v-model="volume"
                  aria-label="Notification volume" /></UFormField
              ><UFormField label="Read-only workspace"
                ><UInput
                  model-value="Lavette Studio"
                  readonly
                  class="w-full" /></UFormField
              ><UFormField label="Unavailable input"
                ><UInput placeholder="Disabled state" disabled class="w-full"
              /></UFormField></div></template></UTabs
      ></UCard>
      <div class="flex flex-col gap-6">
        <UCard
          ><div class="specimen-label">
            <h3>Feedback</h3>
            <code>UAlert · UProgress</code>
          </div>
          <UFormField label="Feedback style" class="mb-4">
            <USelect v-model="feedbackVariant" :items="[
              { label: 'Soft · tinted', value: 'soft' },
              { label: 'Subtle · tinted with border', value: 'subtle' },
              { label: 'Outline · border only', value: 'outline' },
              { label: 'Solid · filled', value: 'solid' },
            ]" class="w-full" />
          </UFormField>
          <div class="space-y-3">
            <UAlert
              color="success"
              :variant="feedbackVariant"
              icon="i-lucide-circle-check"
              title="Everything is in sync"
              description="Your latest changes are saved."
            /><UAlert
              color="info"
              :variant="feedbackVariant"
              icon="i-lucide-info"
              title="New version available"
              description="Refresh to get the latest features."
            /><UAlert
              color="warning"
              :variant="feedbackVariant"
              icon="i-lucide-triangle-alert"
              title="Trial ending soon"
              description="Your trial ends in three days."
            /><UAlert
              color="error"
              :variant="feedbackVariant"
              icon="i-lucide-circle-alert"
              title="That didn’t go through"
              description="Check your connection and try again."
            />
          </div>
          <div class="mt-6 space-y-3">
            <div class="flex justify-between text-sm">
              <span>Component library</span
              ><span class="font-mono">{{ volume }}%</span>
            </div>
            <UProgress :model-value="volume" /></div></UCard
        ><UCard class="flex-1"
          ><div class="specimen-label">
            <h3>People</h3>
            <code>UAvatar · UChip · UBadge</code>
          </div>
          <div class="flex items-center justify-between gap-3">
            <UAvatarGroup
              ><UAvatar
                v-for="name in [
                  'Alex Morgan',
                  'Jamie Chen',
                  'Sam Rivera',
                  'Riley Park',
                ]"
                :key="name"
                :alt="name"
                size="md" /></UAvatarGroup
            ><UChip color="success" inset><UAvatar alt="You" size="lg" /></UChip
            ><UBadge color="success" variant="subtle">Available</UBadge>
          </div></UCard
        >
      </div>
    </div>
    <div class="two-column mt-6">
      <UCard
        ><div class="specimen-label">
          <h3>Disclosure</h3>
          <code>UAccordion</code>
        </div>
        <UAccordion :items="faq" /></UCard
      ><UCard
        ><div class="specimen-label">
          <h3>Overlays</h3>
          <code>UModal · USlideover · UPopover</code>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton variant="outline" @click="modal = true">Open dialog</UButton
          ><UButton variant="soft" @click="drawer = true">Open panel</UButton
          ><UPopover
            ><UButton
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
              >Quick note</UButton
            ><template #content
              ><div class="p-4 max-w-64">
                <h4 class="font-medium mb-1">Pinned note</h4>
                <p class="text-sm text-muted">
                  Ship the new palette before Friday’s review.
                </p>
              </div></template
            ></UPopover
          >
        </div></UCard
      >
    </div>
  </section>
  <PairingShowcase />
  <section id="patterns" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">07 / IN AN APP</div>
        <h2>The same tokens in a working app.</h2>
        <p>A dashboard, a release flow and two marketing cards, with no colors outside the theme.</p>
      </div>
    </div>
    <UCard :ui="{ body: 'p-0 sm:p-0' }"
      ><div class="workspace-header">
        <div class="flex items-center gap-3">
          <span class="workspace-icon"
            ><UIcon name="i-lucide-command" class="size-5"
          /></span>
          <h3 class="font-semibold">Studio workspace</h3>
        </div>
      </div>
      <div class="metrics">
        <div
          v-for="m in [
            { label: 'Active projects', value: '12', change: '+2 this month' },
            {
              label: 'Tasks completed',
              value: '148',
              change: '↑ 18% this month',
            },
            {
              label: 'Team happiness',
              value: '96%',
              change: '+4 pts since May',
            },
          ]"
          :key="m.label"
        >
          <span class="text-sm text-muted">{{ m.label }}</span
          ><strong>{{ m.value }}</strong
          ><span class="text-xs text-muted">{{ m.change }}</span>
        </div>
      </div>
      <div class="table-toolbar">
        <h4 class="font-medium">
          Projects
          <UBadge color="neutral" variant="soft" class="ml-2">{{
            filtered.length
          }}</UBadge>
        </h4>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search projects…"
          aria-label="Search projects"
          @update:model-value="page = 1"
        />
      </div>
      <UTable
        :data="filtered.slice((page - 1) * 4, page * 4)"
        :columns="columns"
        :ui="{ th: 'bg-muted/50' }"
        ><template #name-cell="{ row }"
          ><span class="font-medium text-highlighted">{{
            row.original.name
          }}</span></template
        ><template #owner-cell="{ row }"
          ><div class="flex items-center gap-2">
            <UAvatar :alt="row.original.owner" size="2xs" /><span>{{
              row.original.owner
            }}</span>
          </div></template
        ><template #status-cell="{ row }"
          ><UBadge :color="row.original.color" variant="subtle">{{
            row.original.status
          }}</UBadge></template
        ><template #progress-cell="{ row }"
          ><div class="flex items-center gap-3 min-w-28">
            <UProgress :model-value="row.original.progress" :color="row.original.color" size="xs" /><span
              class="text-xs font-mono"
              >{{ row.original.progress }}%</span
            >
          </div></template
        ></UTable
      >
      <div class="table-footer">
        <span class="text-xs text-muted">{{
          filtered.length
            ? `${(page - 1) * 4 + 1}–${Math.min(page * 4, filtered.length)} of ${filtered.length} projects`
            : "No matching projects"
        }}</span
        ><UPagination
          v-model:page="page"
          :items-per-page="4"
          :total="filtered.length"
          size="xs"
        /></div
    ></UCard>
    <ServiceScenario />
    <div class="two-column mt-6">
      <UCard class="membership"
        ><UBadge variant="subtle">THE STUDIO PLAN</UBadge>
        <h3>A little space<br />for your big ideas.</h3>
        <div class="price">€24<span>/ month</span></div>
        <ul class="space-y-3 mb-7">
          <li
            v-for="benefit in [
              'Unlimited creative projects',
              'Your whole team, together',
              'A home for every little detail',
            ]"
            :key="benefit"
            class="flex gap-2 text-sm"
          >
            <UIcon name="i-lucide-check" class="size-4 text-primary" />{{
              benefit
            }}
          </li>
        </ul>
        <UButton
          block
          trailing-icon="i-lucide-arrow-up-right"
          @click="modal = true"
          >Preview plan dialog</UButton
        ></UCard
      >
      <div class="editorial-card">
        <div class="editorial-art"><ThemeArt variant="still-life" /></div>
        <div class="editorial-copy">
          <div class="eyebrow">FIELD NOTES / 004</div>
          <h3>Finding the extraordinary<br />in the everyday.</h3>
          <UButton
            color="neutral"
            variant="link"
            class="px-0"
            trailing-icon="i-lucide-arrow-right"
            @click="drawer = true"
            >Read the field note</UButton
          >
        </div>
      </div>
    </div>
  </section>
  <section id="tokens" class="specimen-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow">08 / TOKENS</div>
        <h2>Surfaces, text and borders.</h2>
        <p>Nuxt UI turns each token into a Tailwind class, such as <code>bg-elevated</code>, <code>text-muted</code> or <code>border-accented</code>. Click a surface to copy its variable.</p>
      </div>
      <UBadge color="neutral" variant="outline">{{ dark ? "Dark" : "Light" }} mode</UBadge>
    </div>
    <div class="surface-grid">
      <button
        v-for="token in surfaceTokens"
        :key="token"
        @click="emit('copy', `var(--ui-${token})`)"
        :style="{
          background: `var(--ui-${token})`,
          color:
            token === 'bg-inverted'
              ? 'var(--ui-text-inverted)'
              : 'var(--ui-text)',
        }"
      >
        <span>Aa</span><code>{{ token }}</code>
      </button>
    </div>
    <div class="two-column mt-6">
      <UCard
        ><div class="specimen-label">
          <h3>Text & boundaries</h3>
          <code>Semantic tokens</code>
        </div>
        <div class="space-y-3">
          <div
            v-for="token in [
              'text-highlighted',
              'text',
              'text-toned',
              'text-muted',
              'text-dimmed',
            ]"
            :key="token"
            class="flex justify-between gap-3"
            :style="{ color: `var(--ui-${token})` }"
          >
            <span>The details make the difference.</span
            ><code class="text-xs">{{ token }}</code>
          </div>
        </div>
        <div class="border-samples">
          <div
            v-for="token in ['border-muted', 'border', 'border-accented']"
            :key="token"
            :style="{ borderColor: `var(--ui-${token})` }"
          >
            <code>{{ token }}</code>
          </div>
        </div></UCard
      ><UCard
        ><div class="specimen-label">
          <h3>Contrast, considered</h3>
          <UBadge :color="passes ? 'success' : 'warning'" variant="subtle">{{
            passes ? "All checks pass" : "Needs review"
          }}</UBadge>
        </div>
        <p class="text-sm text-muted mb-5">
          Worst case across all four surfaces, including tinted and hover
          states.
        </p>
        <div class="space-y-3">
          <div
            v-for="c in checkedPairs.filter((c) =>
              [
                'Body text',
                'Dimmed text',
                'Primary text',
                'Primary button label',
                'Warning button label',
                'Error text',
                'Control border',
                'Border',
              ].includes(c.label),
            )"
            :key="c.label"
            class="flex justify-between text-sm gap-3"
          >
            <span>{{ c.label }}</span
            ><span
              ><code>{{ c.ratio.toFixed(2) }}:1</code
              ><span class="text-dimmed"> / {{ c.target }}</span></span
            >
          </div>
        </div>
        <USeparator class="my-5" />
        <div class="flex justify-between items-center">
          <span class="text-sm"
            >{{ checkedPairs.length }} checks in this mode</span
          ><UButton
            variant="link"
            trailing-icon="i-lucide-download"
            @click="emit('export')"
            >Export tokens</UButton
          >
        </div></UCard
      >
    </div>
  </section>
  <UModal
    v-model:open="modal"
    title="Upgrade to Studio"
    ><template #body
      ><div class="space-y-5">
        <UAlert
          color="primary"
          variant="soft"
          icon="i-lucide-sparkles"
          title="14 days free"
          description="Cancel any time before your trial ends."
        />
      </div></template
    ><template #footer
      ><UButton color="neutral" variant="outline" @click="modal = false"
        >Not now</UButton
      ><UButton
        @click="
          modal = false;
          activity = 'Dialog action confirmed.';
        "
        >Start trial</UButton
      ></template
    ></UModal
  >
  <USlideover
    v-model:open="drawer"
    title="Field notes"
    description="Issue 004"
    ><template #body
      ><article class="field-note">
        <div class="field-note-art"><ThemeArt variant="still-life" /></div>
        <h2>Finding the extraordinary in the everyday.</h2>
        <p>
          A few well-chosen colors, type that feels right, and space that lets
          an idea breathe. The rest is restraint.
        </p>
        <p>
          Good systems give you a starting point, then get out of the way.
        </p>
      </article></template
    ></USlideover
  >
</template>
