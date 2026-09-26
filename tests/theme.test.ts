import assert from "node:assert/strict";
import { converter, differenceCiede2000, wcagContrast, type Oklch } from "culori";
import { describe, it } from "node:test";
import { generatePalette, exportCSS, inGamut, type Harmony } from "../src/palette";
import { ACCENT_ROLES, THEME_ROLES, SHADES, STATUS, corePaletteColors, composite, hueDistance, type StatusRole } from "../src/theme";

const parse = converter("oklch");
const deltaE = differenceCiede2000();
const HARMONIES: Harmony[] = ["analogous", "complementary"];

/** Resolve a mode's token to a color from the exported CSS alone. */
function cssColors(css: string, mode: "light" | "dark") {
  const block = (selector: string) => css.split(`${selector} {`)[1].split("\n}")[0];
  const tokens = new Map<string, string>();
  for (const source of [block(":root"), block(":root, .light"), ...(mode === "dark" ? [block(".dark")] : [])]) {
    for (const [, name, value] of source.matchAll(/(--[\w-]+): ([^;]+);/g)) tokens.set(name, value);
  }
  const resolve = (name: string): Oklch => {
    const value = tokens.get(name);
    assert.ok(value, `missing ${name}`);
    const reference = /^var\((--[\w-]+)\)$/.exec(value);
    return reference ? resolve(reference[1]) : parse(value)!;
  };
  return resolve;
}

describe("theme generation", () => {
  it("stays in gamut with ordered ramps and passes every contrast check at every setting", () => {
    for (const harmony of HARMONIES) for (let hue = 0; hue < 360; hue += 15) {
      for (const character of [0, 50, 100]) for (const paperWarmth of [0, 50, 100]) {
        const { theme } = generatePalette({ harmony, hue, character, paperWarmth });
        const at = `${harmony} hue=${hue} character=${character} warmth=${paperWarmth}`;
        for (const role of THEME_ROLES) {
          let lastL = 1;
          for (const shade of SHADES) {
            const color = theme.scales[role][shade];
            assert.ok(inGamut(color), `${at}: ${role}-${shade} out of gamut`);
            assert.ok(color.l < lastL, `${at}: ${role}-${shade} is not darker than the previous shade`);
            lastL = color.l;
          }
        }
        for (const mode of ["light", "dark"] as const) for (const check of theme.checks[mode]) {
          assert.ok(check.ratio >= check.target, `${at}: ${mode} ${check.label} ${check.ratio} < ${check.target}`);
        }
      }
    }
  });

  it("keeps the chosen hue for primary and every role distinguishable", () => {
    for (const harmony of HARMONIES) for (let hue = 0; hue < 360; hue += 5) for (const character of [0, 50, 100]) {
      const { theme } = generatePalette({ harmony, hue, character });
      const at = `${harmony} hue=${hue} character=${character}`;
      assert.equal(theme.hues.primary, hue);
      for (const [role, { range }] of Object.entries(STATUS)) {
        const h = theme.hues[role as StatusRole];
        assert.ok(h >= range[0] && h <= range[1], `${at}: ${role} left its recognizable range`);
      }
      for (const mode of ["light", "dark"] as const) {
        const colors = theme.roles[mode];
        // A brand hue on top of a status hue can only move the status so far within its range.
        for (const brand of ["primary", "secondary"] as const) for (const status of Object.keys(STATUS) as StatusRole[]) {
          assert.ok(deltaE(colors[brand], colors[status]) >= 4, `${at}: ${mode} ${brand} looks like ${status}`);
        }
        assert.ok(deltaE(colors.primary, colors.secondary) >= 8, `${at}: ${mode} secondary looks like primary`);
      }
      assert.ok(deltaE(theme.scales.secondary[500], theme.scales.neutral[500]) >= 6, `${at}: secondary looks neutral`);
    }
  });

  it("tints surfaces with the brand hue, warms them toward paper, and keeps dark mode off black", () => {
    for (const hue of [0, 120, 185, 260]) for (const character of [0, 100]) {
      const tinted = generatePalette({ hue, character, paperWarmth: 0 }).theme;
      assert.ok(hueDistance(tinted.hues.neutral, hue) < 1, "brand tint follows the hue");
      assert.ok(tinted.scales.neutral[950].c >= 0.0045, "dark surfaces keep the tint");
      const middle = generatePalette({ hue, character, paperWarmth: 50 }).theme;
      assert.equal(middle.scales.neutral[500].c, 0, "the midpoint is neutral, not a third hue");
      const warm = generatePalette({ hue, character, paperWarmth: 100 }).theme;
      assert.ok(hueDistance(warm.hues.neutral, 80) < 1, "full warmth is warm paper");
      assert.ok(warm.surfaces.dark[0].c >= 0.018, "warm paper carries into dark mode");
      for (const theme of [tinted, warm]) for (const mode of ["light", "dark"] as const) {
        const [bg, muted, elevated, accented] = theme.surfaces[mode];
        const steps = mode === "light" ? [bg.l - muted.l, muted.l - elevated.l, elevated.l - accented.l] : [muted.l - bg.l, elevated.l - muted.l, accented.l - elevated.l];
        assert.ok(steps.every(step => step >= 0.015), `${mode} surfaces must step apart`);
      }
      assert.ok(tinted.surfaces.dark[0].l >= 0.18 && tinted.surfaces.dark[0].l <= 0.22, "dark background is charcoal, not black");
    }
  });

  it("drifts yellow ramps toward amber instead of olive", () => {
    for (const [hue, role] of [[185, "warning"], [95, "primary"]] as const) {
      const ramp = generatePalette({ hue }).theme.scales[role];
      assert.ok(ramp[950].h! < ramp[500].h! - 8, `${role}: dark shades must warm toward amber`);
      assert.ok(ramp[50].h! >= ramp[500].h!);
    }
    const { theme } = generatePalette({ hue: 250 });
    for (const shade of SHADES) assert.equal(theme.scales.primary[shade].h, 250, "non-yellow hues hold constant");
  });

  it("keeps role colors as vivid as their contrast allows", () => {
    for (let hue = 0; hue < 360; hue += 30) for (const character of [0, 100]) {
      const { roles } = generatePalette({ hue, character }).theme;
      for (const role of ACCENT_ROLES) {
        assert.ok(roles.light[role].l >= 0.33, `hue ${hue}: light ${role} is near-black`);
        assert.ok(roles.dark[role].l <= 0.82, `hue ${hue}: dark ${role} is washed out`);
      }
    }
  });

  it("gives each mode distinct text levels", () => {
    const { theme } = generatePalette({});
    for (const mode of ["light", "dark"] as const) {
      const color = cssColors(exportCSS(generatePalette({})), mode);
      const levels = ["--ui-text-dimmed", "--ui-text-muted", "--ui-text-toned", "--ui-text", "--ui-text-highlighted"].map(token => color(token).l);
      for (let i = 1; i < levels.length; i++) {
        assert.ok(Math.abs(levels[i] - levels[i - 1]) >= 0.03, `${mode} text levels ${levels}`);
      }
      assert.equal(new Set(theme.surfaces[mode].map(c => c.l)).size, 4);
    }
  });

  it("exports the Nuxt UI token contract, resolvable without color-mix", () => {
    const css = exportCSS(generatePalette({}));
    for (const role of THEME_ROLES) for (const shade of SHADES) assert.ok(css.includes(`--ui-color-${role}-${shade}: oklch(`));
    for (const token of ["--ui-radius", "--ui-focus-offset", "--font-sans", "--font-mono", "--font-display", "--leading-display"]) assert.ok(css.includes(`${token}:`));
    assert.ok(css.includes(":root, .light {") && css.includes(".dark {") && css.includes("@theme {"));
    assert.ok(!css.includes("color-mix(in oklab"), "ramps are literal OKLCH values");
    assert.doesNotMatch(css, /\.(?:bg|text|outline|hover|active)[-\\]/, "tokens only: no utility overrides");
    assert.equal(css.match(/--font-sans:/g)?.length, 1, "fonts are declared once");
    for (const [, token] of css.matchAll(/(--[\w-]+)\s*:/g)) assert.match(token, /^--(?:ui-|font-|leading-)/);
    for (const mode of ["light", "dark"] as const) {
      const color = cssColors(css, mode);
      for (const suffix of ["bg", "bg-muted", "bg-elevated", "bg-accented", "bg-inverted", "text-dimmed", "text-muted", "text-toned", "text", "text-highlighted", "text-inverted", "border", "border-muted", "border-accented", "border-inverted"]) {
        assert.ok(inGamut(color(`--ui-${suffix}`)));
      }
      for (const role of ACCENT_ROLES) assert.ok(inGamut(color(`--ui-${role}`)));
    }
  });

  it("independently verifies every pair Nuxt UI renders with the exported tokens", () => {
    for (const harmony of HARMONIES) for (const hue of [30, 95, 150, 250]) for (const character of [0, 100]) for (const paperWarmth of [0, 100]) {
      const css = exportCSS(generatePalette({ harmony, hue, character, paperWarmth }));
      for (const mode of ["light", "dark"] as const) {
        const color = cssColors(css, mode);
        const surfaces = ["--ui-bg", "--ui-bg-muted", "--ui-bg-elevated", "--ui-bg-accented"].map(color);
        const label = color("--ui-text-inverted");
        for (const surface of surfaces) {
          for (const text of ["--ui-text-highlighted", "--ui-text", "--ui-text-toned", "--ui-text-muted", "--ui-text-dimmed"]) {
            assert.ok(wcagContrast(color(text), surface) >= 4.5, `${mode} ${text}`);
          }
          assert.ok(wcagContrast(color("--ui-border-accented"), surface) >= 3);
          assert.ok(wcagContrast(color("--ui-border"), surface) >= 1.5);
          assert.ok(wcagContrast(color("--ui-border-muted"), surface) >= 1.25);
        }
        assert.ok(wcagContrast(label, color("--ui-bg-inverted")) >= 4.5);
        for (const role of ACCENT_ROLES) {
          const c = color(`--ui-${role}`);
          assert.ok(wcagContrast(composite(label, c, 0.9), c) >= 4.5, `${mode} ${role} solid label`);
          for (const surface of surfaces) {
            assert.ok(wcagContrast(label, composite(c, surface, 0.75)) >= 4.5, `${mode} ${role} solid hover`);
            assert.ok(wcagContrast(composite(c, surface, 0.75), surface) >= 4.5, `${mode} ${role} link hover`);
            for (const alpha of [0, 0.1, 0.15]) {
              const tint = composite(c, surface, alpha);
              assert.ok(wcagContrast(composite(c, tint, 0.9), tint) >= 4.5, `${mode} ${role} text on ${alpha} tint`);
            }
          }
        }
      }
    }
  });

  it("shows the colors the preview uses as swatches", () => {
    const palette = generatePalette({ harmony: "complementary", hue: 210 });
    const light = corePaletteColors(palette, "light");
    const dark = corePaletteColors(palette, "dark");
    assert.deepEqual(light.map(swatch => swatch.label), ["Background", "Text", "Primary", "Secondary"]);
    assert.deepEqual(light[0].color, palette.theme.surfaces.light[0]);
    assert.deepEqual(dark[0].color, palette.theme.surfaces.dark[0]);
    assert.deepEqual(light[2].color, palette.theme.roles.light.primary);
    assert.deepEqual(light[3].color, palette.theme.roles.light.secondary);
    assert.deepEqual(dark[2].color, palette.theme.roles.dark.primary);
  });
});
