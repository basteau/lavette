import assert from "node:assert/strict";
import { converter, differenceCiede2000, formatHex, wcagContrast, type Oklch } from "culori";
import { describe, it } from "node:test";
import { generatePalette, exportCSS, inGamut, type Harmony, type SurfaceTint } from "../src/palette";
import { ACCENT_ROLES, DARK_L, THEME_ROLES, SHADES, STATUS, corePaletteColors, composite, hueDistance, type StatusRole } from "../src/theme";

const parse = converter("oklch");
const deltaE = differenceCiede2000();
const HARMONIES: Harmony[] = ["analogous", "complementary"];
/** Every surface tint at full strength, plus neutral grey and a half-strength tint. */
const SURFACES: { surfaceTint: SurfaceTint; tintStrength: number }[] = [
  { surfaceTint: "primary", tintStrength: 0 }, { surfaceTint: "primary", tintStrength: 100 },
  { surfaceTint: "warm", tintStrength: 50 }, { surfaceTint: "warm", tintStrength: 100 }, { surfaceTint: "cool", tintStrength: 100 },
];

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
      for (const vividness of [0, 50, 100]) for (const surface of SURFACES) for (const darkDepth of [0, 100]) {
        const { theme } = generatePalette({ harmony, hue, vividness, ...surface, darkDepth });
        const at = `${harmony} hue=${hue} vividness=${vividness} ${surface.surfaceTint}=${surface.tintStrength} depth=${darkDepth}`;
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
    for (const harmony of HARMONIES) for (let hue = 0; hue < 360; hue += 5) for (const vividness of [0, 50, 100]) {
      const { theme } = generatePalette({ harmony, hue, vividness });
      const at = `${harmony} hue=${hue} vividness=${vividness}`;
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

  it("tints surfaces with the primary hue, warm paper, or cool slate, at any strength", () => {
    for (const hue of [0, 120, 185, 260]) for (const vividness of [0, 100]) {
      const tinted = generatePalette({ hue, vividness, surfaceTint: "primary", tintStrength: 100 }).theme;
      assert.ok(hueDistance(tinted.hues.neutral, hue) < 1, "primary tint follows the hue");
      assert.ok(tinted.scales.neutral[950].c >= 0.0045, "dark surfaces keep the tint");
      for (const surfaceTint of ["primary", "warm", "cool"] as const) {
        const grey = generatePalette({ hue, vividness, surfaceTint, tintStrength: 0 }).theme;
        assert.equal(grey.scales.neutral[500].c, 0, "strength 0 is neutral grey");
      }
      const warm = generatePalette({ hue, vividness, surfaceTint: "warm", tintStrength: 100 }).theme;
      assert.ok(hueDistance(warm.hues.neutral, 80) < 1, "warm paper");
      assert.ok(warm.surfaces.dark[0].c >= 0.018, "warm paper carries into dark mode");
      const cool = generatePalette({ hue, vividness, surfaceTint: "cool", tintStrength: 100 }).theme;
      assert.ok(hueDistance(cool.hues.neutral, 250) < 1, "cool paper is slate");
      assert.ok(cool.surfaces.light[0].c >= 0.01 && cool.surfaces.dark[0].c >= 0.01, "cool paper carries into both modes");
      assert.ok(deltaE(cool.surfaces.light[0], warm.surfaces.light[0]) >= 1.5, "cool and warm paper look different");
      for (const theme of [tinted, warm, cool]) for (const mode of ["light", "dark"] as const) {
        const [bg, muted, elevated, accented] = theme.surfaces[mode];
        const steps = mode === "light" ? [bg.l - muted.l, muted.l - elevated.l, elevated.l - accented.l] : [muted.l - bg.l, elevated.l - muted.l, accented.l - elevated.l];
        assert.ok(steps.every(step => step >= 0.015), `${mode} surfaces must step apart`);
      }
    }
    const surfaces = (vividness: number) => generatePalette({ vividness, surfaceTint: "primary", tintStrength: 60, darkDepth: 50 }).theme.surfaces;
    assert.deepEqual(surfaces(0), surfaces(100), "vividness leaves surfaces alone");
  });

  it("sets dark mode depth independently of vividness, from soft charcoal to near black", () => {
    for (const vividness of [0, 100]) {
      const soft = generatePalette({ vividness, darkDepth: 0 }).theme.surfaces.dark;
      const deep = generatePalette({ vividness, darkDepth: 100 }).theme.surfaces.dark;
      assert.equal(soft[0].l, DARK_L.soft);
      assert.equal(deep[0].l, DARK_L.deep, "near black, never black");
    }
    const light = (vividness: number) => generatePalette({ vividness, darkDepth: 50 }).theme.surfaces;
    assert.deepEqual(light(0).dark.map(c => c.l), light(100).dark.map(c => c.l), "vividness no longer moves the dark background");
    // Themes saved before this setting keep their dark background (0.215 to 0.18 by vividness),
    // within one slider step (0.001).
    for (const vividness of [0, 50, 100]) {
      const legacy = generatePalette({ vividness }).theme.surfaces.dark[0].l;
      assert.ok(Math.abs(legacy - (0.215 - 0.035 * vividness / 100)) <= 0.001, `vividness ${vividness}: ${legacy}`);
    }
  });

  it("puts a brand color exactly on the primary ramp without breaking it", () => {
    const brands = ["#1f4fd8", "#ff0000", "#ffff00", "#00ff00", "#1e3a8a", "#0b1a40", "#fde68a", "#bae6fd", "#7c3aed", "#312e81", "#93c5fd", "#0d9488", "#f97316", "#4414e5", "#8dc336", "#4c372a",
      // Saturated blues sit where the sRGB gamut has gaps in chroma at dark shades.
      "#0033ff", "#0011eb", "#0104d4"];
    for (const brandColor of brands) for (const harmony of HARMONIES) for (const vividness of [0, 100]) for (const darkDepth of [0, 100]) for (const surface of SURFACES) {
      const palette = generatePalette({ brandColor, harmony, vividness, darkDepth, ...surface });
      const { theme } = palette;
      const at = `${brandColor} ${harmony} vividness=${vividness} depth=${darkDepth} ${surface.surfaceTint}=${surface.tintStrength}`;
      assert.equal(palette.values.brandColor, brandColor, `${at}: brand color was rejected`);
      assert.ok(theme.brandShade !== null, `${at}: no shade took the brand color`);
      const exported = cssColors(exportCSS(palette), "light")(`--ui-color-primary-${theme.brandShade}`);
      assert.equal(formatHex(exported), brandColor, `${at}: primary-${theme.brandShade} is not the brand color`);
      assert.ok(hueDistance(theme.hues.primary, parse(brandColor)!.h!) < 0.01);
      let lastL = 1;
      for (const shade of SHADES) {
        const color = theme.scales.primary[shade];
        assert.ok(inGamut(color), `${at}: primary-${shade} out of gamut`);
        assert.ok(color.l < lastL, `${at}: primary-${shade} is not darker than the previous shade`);
        lastL = color.l;
      }
      for (const mode of ["light", "dark"] as const) for (const check of theme.checks[mode]) {
        assert.ok(check.ratio >= check.target, `${at}: ${mode} ${check.label} ${check.ratio} < ${check.target}`);
      }
      assert.ok(deltaE(theme.scales.secondary[500], theme.scales.neutral[500]) >= 6, `${at}: secondary looks neutral`);
    }
    // A readable brand color is the button color itself; one that misses by a hair sits beside it.
    assert.equal(generatePalette({ brandColor: "#312e81" }).theme.brandShade, 700);
    assert.equal(generatePalette({ brandColor: "#93c5fd" }).theme.brandShade, 300);
    assert.equal(generatePalette({ brandColor: "#1e3a8a" }).theme.brandShade, 600);
    assert.equal(generatePalette({}).theme.brandShade, null);
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
    for (let hue = 0; hue < 360; hue += 30) for (const vividness of [0, 100]) {
      const { roles } = generatePalette({ hue, vividness }).theme;
      for (const role of ACCENT_ROLES) {
        assert.ok(roles.light[role].l >= 0.33, `hue ${hue}: light ${role} is near-black`);
        assert.ok(roles.dark[role].l <= 0.82, `hue ${hue}: dark ${role} is washed out`);
      }
    }
  });

  it("gives each mode distinct text levels at every dark depth", () => {
    for (const darkDepth of [0, 50, 100]) for (const mode of ["light", "dark"] as const) {
      const palette = generatePalette({ darkDepth });
      const { theme } = palette;
      const color = cssColors(exportCSS(palette), mode);
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
    for (const harmony of HARMONIES) for (const hue of [30, 95, 150, 250]) for (const vividness of [0, 100]) for (const surface of SURFACES) for (const darkDepth of [0, 100]) {
      const css = exportCSS(generatePalette({ harmony, hue, vividness, ...surface, darkDepth }));
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
