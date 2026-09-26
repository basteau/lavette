import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  exportCSS,
  format,
  generatePalette,
  normalize,
  randomValues,
} from "../src/palette";

describe("palette engine", () => {
  it("normalizes unknown and out-of-range persisted values", () => {
    for (const input of [
      null,
      undefined,
      [],
      "invalid",
      { hue: Symbol(), depth: Infinity },
    ]) {
      const values = normalize(input);
      assert.ok(
        Object.values(values).every(
          (value) => typeof value === "string" || Number.isFinite(value),
        ),
      );
    }
    assert.deepEqual(normalize({ uiSize: "lg" }), normalize({}), "legacy size settings are ignored");
    assert.deepEqual(
      normalize({
        recipe: "tonal",
        hue: -10,
        mood: 110,
        depth: -10,
        paperWarmth: 25,
      }),
      {
        recipe: "tonal",
        hue: 350,
        mood: 100,
        depth: 0,
        paperWarmth: 25,
        radius: 0.125,
        focusOffset: 0,
        fontPairing: "studio",
      },
    );
  });

  it("generates randomized values within the control ranges", () => {
    const signatures = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const values = randomValues();
      assert.deepEqual(normalize(values), values);
      assert.ok(values.hue >= 0 && values.hue <= 359);
      assert.equal(values.mood, values.depth, "new themes use one character setting");
      signatures.add(JSON.stringify(values));
    }
    assert.ok(signatures.size > 1);
  });

  it("keeps both recipes in gamut and meets every contrast target", () => {
    for (const recipe of ["tonal", "soft"] as const) {
      for (let hue = 0; hue < 360; hue += 30) {
        for (const mood of [0, 50, 100]) {
          for (const depth of [0, 50, 100]) {
            for (const paperWarmth of [0, 100]) {
              const palette = generatePalette({
                recipe,
                hue,
                mood,
                depth,
                paperWarmth,
              });
              assert.equal(palette.gamut, true);
              assert.equal(Object.keys(palette.colors).length, 4);
              for (const check of palette.checks) {
                assert.ok(
                  check.ratio >= check.target,
                  `${recipe} ${hue}°: ${check.label} ${check.ratio}`,
                );
              }
            }
          }
        }
      }
    }
  });

  it("exports the exact displayed OKLCH values and semantic tokens", () => {
    const palette = generatePalette(randomValues());
    const css = exportCSS(palette);
    assert.ok(css.startsWith("/* lavette"));
    assert.ok(css.includes(`--ui-bg: ${format(palette.colors.canvas)};`));
    for (const role of ["primary", "secondary"] as const) {
      assert.ok(css.includes(`--ui-color-${role}-500: ${format(palette.theme.seeds[role])};`));
    }
    assert.ok(!css.includes("#"));
    assert.deepEqual(generatePalette(palette.values), palette);
  });
});
