import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportCSS, format, generatePalette, normalize, parseBrandColor, randomValues } from "../src/palette";

describe("palette settings", () => {
  it("normalizes unknown and out-of-range persisted values", () => {
    for (const input of [null, undefined, [], "invalid", { hue: Symbol(), character: Infinity }]) {
      const values = normalize(input);
      assert.ok(Object.values(values).every(value => typeof value === "string" || Number.isFinite(value)));
      assert.deepEqual(normalize(values), values);
    }
    assert.deepEqual(normalize({ harmony: "complementary", hue: -10, character: 110, surfaceTone: 25, paper: "slate" }), {
      harmony: "complementary",
      hue: 350,
      character: 100,
      surfaceTone: 25,
      paper: "warm",
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

  it("migrates saved themes from the recipe/mood/depth settings", () => {
    const legacy = normalize({ recipe: "soft", hue: 40, mood: 70, depth: 20, paperWarmth: 60, uiSize: "lg" });
    assert.equal(legacy.harmony, "complementary");
    assert.equal(legacy.character, 45);
    assert.ok(!("depth" in legacy) && !("mood" in legacy) && !("uiSize" in legacy));
    assert.equal(normalize({ recipe: "tonal" }).harmony, "analogous");
    assert.equal(normalize({ mood: 80, depth: 40 }).character, 60, "character was the mood/depth average");
    assert.equal(normalize({ hue: null, paperWarmth: "" }).hue, 185, "empty values fall back to defaults");
    const warmth = normalize({ paperWarmth: 80 });
    assert.equal(warmth.surfaceTone, 80, "paper warmth became surface tone");
    assert.equal(warmth.paper, "warm");
    assert.ok(!("paperWarmth" in warmth));
    assert.equal(normalize({ hue: 359.9999 }).hue, 0);
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
