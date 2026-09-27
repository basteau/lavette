import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportCSS, format, generatePalette, normalize, parseBrandColor, randomValues } from "../src/palette";

const pick = ({ surfaceTint, tintStrength }: ReturnType<typeof normalize>) => ({ surfaceTint, tintStrength });

describe("palette settings", () => {
  it("normalizes unknown and out-of-range persisted values", () => {
    for (const input of [null, undefined, [], "invalid", { hue: Symbol(), vividness: Infinity }]) {
      const values = normalize(input);
      assert.ok(Object.values(values).every(value => typeof value === "string" || Number.isFinite(value)));
      assert.deepEqual(normalize(values), values);
    }
    assert.deepEqual(normalize({ harmony: "complementary", hue: -10, vividness: 110, surfaceTint: "slate", tintStrength: 25 }), {
      harmony: "complementary",
      hue: 350,
      vividness: 100,
      surfaceTint: "primary",
      tintStrength: 25,
      darkDepth: 65,
      brandColor: "",
      radius: 0.125,
      focusOffset: 0,
      fontPairing: "studio",
    });
    assert.equal(normalize({ radius: 100 }).radius, 0.5);
    assert.equal(normalize({ radius: -1 }).radius, 0);
    assert.equal(normalize({ focusOffset: -5 }).focusOffset, 0);
    assert.equal(normalize({ focusOffset: 99 }).focusOffset, 4);
    assert.equal(normalize({ darkDepth: 140 }).darkDepth, 100);
    assert.equal(normalize({ darkDepth: -3 }).darkDepth, 0);
  });

  it("migrates saved themes from earlier settings", () => {
    const legacy = normalize({ recipe: "soft", hue: 40, mood: 70, depth: 20, paperWarmth: 60, uiSize: "lg" });
    assert.equal(legacy.harmony, "complementary");
    assert.equal(legacy.vividness, 45);
    assert.ok(!("depth" in legacy) && !("mood" in legacy) && !("uiSize" in legacy));
    assert.equal(normalize({ recipe: "tonal" }).harmony, "analogous");
    assert.equal(normalize({ mood: 80, depth: 40 }).vividness, 60, "vividness was the mood/depth average");
    assert.equal(normalize({ character: 70 }).vividness, 70, "color character became vividness");
    assert.equal(normalize({ hue: null, paperWarmth: "" }).hue, 185, "empty values fall back to defaults");
    assert.equal(normalize({ hue: 359.9999 }).hue, 0);
    // Paper warmth faded a primary tint out by 50, then warm paper in.
    assert.deepEqual(pick(normalize({ paperWarmth: 80 })), { surfaceTint: "warm", tintStrength: 60 });
    assert.deepEqual(pick(normalize({ paperWarmth: 50 })), { surfaceTint: "warm", tintStrength: 0 });
    assert.deepEqual(pick(normalize({ paperWarmth: 0, character: 100 })), { surfaceTint: "primary", tintStrength: 100 });
    for (const [paperWarmth, character] of [[0, 0], [20, 70], [30, 50], [45, 100]]) {
      const was = (1 - paperWarmth / 50) * (0.005 + 0.006 * character / 100);
      const now = generatePalette({ paperWarmth, character }).theme.surfaces.light[0].c;
      assert.ok(Math.abs(now - was) <= 0.0001, `warmth ${paperWarmth}, character ${character}: ${now} vs ${was}`);
    }
    const migrated = normalize({ paperWarmth: 80, character: 30 });
    assert.ok(!("paperWarmth" in migrated) && !("character" in migrated));
  });

  it("reads brand colors in any CSS notation as sRGB hex, and rejects greys", () => {
    assert.deepEqual(parseBrandColor("#1F4FD8"), { hex: "#1f4fd8" });
    assert.deepEqual(parseBrandColor(" 1f4fd8 "), { hex: "#1f4fd8" }, "the # is optional");
    assert.deepEqual(parseBrandColor("rgb(31 79 216)"), { hex: "#1f4fd8" });
    assert.match((parseBrandColor("oklch(0.8 0.4 150)") as { hex: string }).hex, /^#[0-9a-f]{6}$/, "wide-gamut input is fitted to sRGB");
    assert.deepEqual(parseBrandColor(""), { hex: "" }, "empty clears");
    assert.ok("error" in parseBrandColor("brandish"));
    assert.ok("error" in parseBrandColor("#808080"), "greys belong to the neutral scale");
    assert.ok("error" in parseBrandColor("#000"));
  });

  it("takes primary's hue from the brand color", () => {
    const values = normalize({ brandColor: "#1F4FD8", hue: 10 });
    assert.equal(values.brandColor, "#1f4fd8");
    assert.ok(Math.abs(values.hue - 264.52) < 0.01, `hue ${values.hue}`);
    assert.match(String(values.hue), /^\d+(\.\d{1,3})?$/, "hue keeps at most three decimals");
    assert.equal(normalize({ hue: 545.2 }).hue, 185.2, "wrapping leaves no float noise");
    assert.deepEqual(normalize(values), values);
    assert.equal(normalize({ brandColor: "#808080", hue: 10 }).brandColor, "", "an invalid brand color is dropped");
    assert.equal(normalize({ brandColor: "#808080", hue: 10 }).hue, 10);
    assert.equal(randomValues(values).brandColor, "", "shuffling picks a new color direction");
  });

  it("shuffles colors while keeping type, radius, focus, and dark depth settings", () => {
    const base = normalize({ fontPairing: "library", radius: 0.375, focusOffset: 2, darkDepth: 90 });
    const signatures = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const values = randomValues(base);
      assert.deepEqual(normalize(values), values);
      assert.equal(values.fontPairing, "library");
      assert.equal(values.radius, 0.375);
      assert.equal(values.focusOffset, 2);
      assert.equal(values.darkDepth, 90);
      signatures.add(JSON.stringify(values));
    }
    assert.ok(signatures.size > 1);
  });

  it("exports exactly the generated values, deterministically", () => {
    const palette = generatePalette(randomValues());
    const css = exportCSS(palette);
    assert.ok(css.startsWith("/* lavette"));
    assert.ok(css.includes(`--ui-bg: ${format(palette.theme.surfaces.light[0])};`));
    assert.ok(css.includes(`--ui-color-primary-700: ${format(palette.theme.roles.light.primary)};`));
    assert.ok(css.includes("--ui-primary: var(--ui-color-primary-700);"));
    assert.ok(css.includes("--ui-primary: var(--ui-color-primary-300);"));
    assert.match(css, /--ui-radius: 0\.125rem/);
    assert.match(exportCSS(generatePalette({ focusOffset: 3 })), /--ui-focus-offset: 3px/);
    assert.match(css, /outline-offset: var\(--ui-focus-offset, 0px\)/);
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, "colors are OKLCH only");
    assert.deepEqual(generatePalette(palette.values), palette);
  });
});
