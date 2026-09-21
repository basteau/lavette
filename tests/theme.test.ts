import assert from "node:assert/strict";
import { converter, interpolate, wcagContrast } from "culori";
import { describe, it } from "node:test";
import { generatePalette, normalize, inGamut, exportCSS } from "../src/palette";
import { THEME_ROLES, SHADES, STATUS_HUES, corePaletteColors, composite } from "../src/theme";

describe("Nuxt UI theme", () => {
  it("migrates old saved settings and bounds new controls", () => {
    assert.equal(normalize({}).radius, 0.125);
    assert.equal(normalize({}).focusOffset, 0);
    assert.equal(normalize({ focusOffset: -5 }).focusOffset, 0);
    assert.equal(normalize({ focusOffset: 99 }).focusOffset, 4);
    const css = exportCSS(generatePalette({ focusOffset: 3 }));
    assert.match(css, /--ui-focus-offset: 3px/);
    assert.match(css, /outline-offset: var\(--ui-focus-offset, 0px\)/);
    assert.ok(!("semanticHarmony" in normalize({ semanticHarmony: 100 })));
    assert.equal(normalize({ radius: 100, semanticHarmony: -5 }).radius, 0.5);

    assert.equal(normalize({ radius: -1 }).radius, 0);
  });

  it("preserves the existing tonal and complementary hue relationships", () => {
    for (const hue of [0, 80, 220, 359]) {
      const tonal = generatePalette({ recipe: "tonal", hue }).theme;
      assert.equal(tonal.seeds.primary.h, hue);
      assert.equal(tonal.seeds.secondary.h, hue);
      const soft = generatePalette({ recipe: "soft", hue }).theme;
      assert.equal(soft.seeds.primary.h, (hue + 215) % 360);
      assert.equal(soft.seeds.secondary.h, (hue + 310) % 360);
    }
  });

  it("keeps status hues and sufficient chroma independent of brand hue and quiet settings", () => {
    for (const mood of [0, 50, 100]) for (const depth of [0, 50, 100]) {
      const baseline = generatePalette({ hue: 0, mood, depth }).theme;
      for (const [role, hue] of Object.entries(STATUS_HUES)) {
        const key = role as keyof typeof STATUS_HUES;
        assert.equal(baseline.seeds[key].h, hue);
        assert.ok(baseline.seeds[key].c >= 0.13, `${key} lost its color`);
        for (const mode of ["light", "dark"] as const) {
          const colors = baseline.semantic[mode][key];
          assert.ok(colors.text.c >= (mode === "light" ? 0.09 : 0.035), `${mode} ${key} text lost its color`);
          if (mode === "light") {
            assert.ok(colors.text.l >= 0.42, `${key} text became near-black`);
            assert.ok(colors.fill.l > colors.text.l, `${key} fill should be brighter than text`);
            assert.ok(colors.fill.c >= 0.11, `${key} fill lost its color`);
          }
        }
        for (const brandHue of [90, 180, 270]) {
          assert.deepEqual(generatePalette({ hue: brandHue, mood, depth }).theme.seeds[key], baseline.seeds[key]);
        }
      }
    }
  });

  it("keeps tonal primary and secondary distinct even when primary is gamut-limited", () => {
    for (let hue = 0; hue < 360; hue += 5) for (const mood of [0, 100]) {
      const { primary, secondary } = generatePalette({ recipe: "tonal", hue, mood }).theme.seeds;
      assert.equal(primary.h, secondary.h);
      assert.ok(secondary.c < primary.c * 0.46);
      assert.ok(primary.c - secondary.c > 0.03);
    }
  });

  it("shows base brand colors consistently while background/text follow the active mode", () => {
    const palette = generatePalette({ recipe: "soft", hue: 210, mood: 0, depth: 0 });
    const light = corePaletteColors(palette, "light");
    const dark = corePaletteColors(palette, "dark");
    assert.deepEqual(light.map(swatch => swatch.label), ["Background", "Text", "Primary", "Secondary"]);
    assert.deepEqual(light[0].color, palette.colors.canvas);
    assert.deepEqual(dark[0].color, palette.theme.scales.neutral[950]);
    assert.deepEqual(light[1].color, palette.theme.scales.neutral[900]);
    assert.deepEqual(dark[1].color, palette.theme.scales.neutral[100]);
    for (const swatches of [light, dark]) {
      assert.notDeepEqual(swatches[2].color, palette.colors.accent);
      assert.notDeepEqual(swatches[3].color, palette.colors.support);
      assert.ok(swatches.every(swatch => inGamut(swatch.color)));
    }
    assert.equal(light[2].token, "--ui-color-primary-500");
    assert.equal(light[3].token, "--ui-color-secondary-500");
    assert.deepEqual(light[2].color, palette.theme.seeds.primary);
    assert.deepEqual(light[3].color, palette.theme.seeds.secondary);
    assert.deepEqual(light[2].color, dark[2].color);
    assert.deepEqual(light[3].color, dark[3].color);
    assert.ok(light[2].color.l >= 0.6);
    assert.ok(light[3].color.l >= 0.6);
  });

  it("exports the documented token contract, both modes, and no unresolved aliases", () => {
    const p = generatePalette({});
    const css = exportCSS(p);
    for (const role of THEME_ROLES) for (const shade of SHADES) assert.ok(css.includes(`--ui-color-${role}-${shade}:`));
    for (const suffix of ["text-dimmed", "text-muted", "text-toned", "text", "text-highlighted", "text-inverted", "bg", "bg-muted", "bg-elevated", "bg-accented", "bg-inverted", "border", "border-muted", "border-accented", "border-inverted"]) {
      assert.ok(p.theme.modes.light[`--ui-${suffix}`]);
      assert.ok(p.theme.modes.dark[`--ui-${suffix}`]);
    }
    for (const token of ["--ui-radius", "--ui-container", "--ui-header-height", "--font-sans", "--font-mono", "--font-display"]) assert.ok(css.includes(`${token}:`));
    assert.ok(css.includes(".dark {"));
    assert.ok(css.includes(":root, .light {"));
    assert.ok(css.includes("--ui-radius: 0.125rem"));
    assert.ok(css.includes("@theme {"));
    assert.doesNotMatch(css, /--(?:palette|lavette)-|--(?:ink|canvas|support|accent|surface|action|on-action|text|line|soft):/);
    for (const [, token] of css.matchAll(/(--[\w-]+)\s*:/g)) {
      assert.match(token, /^--(?:ui-|font-|leading-)/);
    }
    assert.equal((css.match(/color-mix\(in oklab/g) ?? []).length, 50);
    for (const mode of ["light", "dark"] as const) {
      const all = { ...p.theme.tokens, ...p.theme.modes[mode] };
      const resolve = (token: string, seen = new Set<string>()): void => {
        assert.ok(!seen.has(token), `cyclic token ${token}`);
        assert.ok(token in all, `missing token ${token}`);
        for (const [, reference] of all[token as keyof typeof all].matchAll(/var\((--[\w-]+)\)/g)) resolve(reference, new Set([...seen, token]));
      };
      Object.keys(all).forEach(key => resolve(key));
    }
  });

  it("matches emitted CSS Oklab interpolation independently", () => {
    const lab = converter("oklab");
    for (const recipe of ["tonal", "soft"]) for (const hue of [0, 95, 210, 300]) {
      const { theme } = generatePalette({ recipe, hue, mood: 100 });
      for (const role of THEME_ROLES) for (const shade of SHADES) {
        const css = theme.tokens[`--ui-color-${role}-${shade}`];
        if (shade === 500 || (role in STATUS_HUES && shade > 500)) {
          assert.deepEqual(converter("oklch")(css), theme.scales[role][shade]);
          continue;
        }
        const [, source, percent, endpoint] = css.match(/var\(--ui-color-([a-z]+)-500\) ([\d.]+)%, (white|black)/)!;
        assert.equal(source, role);
        const actual = lab(theme.scales[role][shade]);
        const expected = interpolate([endpoint, theme.seeds[role]], "oklab")(Number(percent) / 100);
        for (const axis of ["l", "a", "b"] as const) assert.ok(Math.abs(actual[axis] - expected[axis]) < 1e-12);
      }
    }
  });

  it("exports the same semantic utility treatments and independently verifies their actual pairs", () => {
    const parse = converter("oklch");
    for (const recipe of ["tonal", "soft"]) for (const mood of [0, 100]) for (const depth of [0, 100]) for (const paperWarmth of [0, 100]) {
      const palette = generatePalette({ recipe, mood, depth, paperWarmth });
      const css = exportCSS(palette);
      for (const mode of ["light", "dark"] as const) {
        const dark = mode === "dark";
        const n = palette.theme.scales.neutral;
        const surfaces = [dark ? n[950] : palette.colors.canvas, n[dark ? 900 : 50], n[dark ? 800 : 100], n[dark ? 800 : 200]];
        const tokens = palette.theme.modes[mode];
        for (const role of Object.keys(STATUS_HUES) as (keyof typeof STATUS_HUES)[]) {
          const colors = palette.theme.semantic[mode][role];
          assert.deepEqual(parse(tokens[`--ui-${role}`]), colors.text);
          for (const [name, color] of Object.entries({ fill: colors.fill, hover: colors.hover, "on-fill": colors.onFill, indicator: colors.indicator, tint: colors.tint })) {
            assert.deepEqual(parse(tokens[`--ui-${role}-${name}`]), color);
            assert.ok(css.includes(`--ui-${role}-${name}: ${tokens[`--ui-${role}-${name}`]};`));
            assert.ok(inGamut(color));
          }
          for (const fill of [colors.fill, colors.hover]) assert.ok(wcagContrast(colors.onFill, fill) >= (!dark && role === "warning" ? 7 : 4.5));
          for (const surface of surfaces) {
            assert.ok(wcagContrast(colors.text, surface) >= 4.5);
            assert.ok(wcagContrast(colors.indicator, surface) >= 3);
            for (const alpha of [0.1, 0.15]) assert.ok(wcagContrast(colors.text, composite(colors.tint, surface, alpha)) >= 4.5);
          }
          // Nuxt UI alert descriptions must retain the measured text contrast.
          assert.ok(css.includes(`.text-${role} [data-slot=description].opacity-90, .bg-${role}.text-inverted [data-slot=description].opacity-90 { opacity: 1; }`));
          assert.ok(css.includes(`background-color: var(--ui-${role}-fill)`));
          assert.ok(css.includes(`--ui-text-inverted: var(--ui-${role}-on-fill)`));
          assert.ok(css.includes(`color-mix(in srgb, var(--ui-${role}-tint) 15%, transparent)`));
        }
        if (!dark) {
          const muted = parse(tokens["--ui-border-muted"])!;
          const standard = parse(tokens["--ui-border"])!;
          assert.ok(muted.l > standard.l);
          assert.ok(standard.l > n[500].l);
          for (const surface of surfaces) {
            assert.ok(wcagContrast(muted, surface) >= 1.5);
            assert.ok(wcagContrast(standard, surface) >= 1.9);
          }
        }
      }
    }
  });

  it("keeps all mixed shades in sRGB and measured role pairs readable at control extremes", () => {
    for (const recipe of ["tonal", "soft"]) for (let hue = 0; hue < 360; hue += 15) {
      for (const mood of [0, 100]) for (const depth of [0, 100]) for (const paperWarmth of [0, 100]) {
        const { theme } = generatePalette({ recipe, hue, mood, depth, paperWarmth });
        for (const role of THEME_ROLES) {
          let lastL = 1;
          for (const shade of SHADES) {
            const color = theme.scales[role][shade];
            assert.ok(inGamut(color), `${role}-${shade} out of gamut: ${JSON.stringify(color)}`);
            assert.ok(color.l < lastL);
            assert.equal(color.h, theme.seeds[role].h);
            lastL = color.l;
          }
        }
        for (const [mode, checks] of Object.entries(theme.checks)) for (const check of checks) {
          assert.ok(check.ratio >= check.target, `${recipe} hue=${hue}, mood=${mood}, depth=${depth}, warmth=${paperWarmth}: ${mode} ${check.label} ${check.ratio} < ${check.target}`);
        }
      }
    }
  });
});
