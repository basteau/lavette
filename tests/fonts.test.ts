import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { FONT_PAIRINGS, fontAssets, fontSizeAdjust, allFontFaces } from "../src/fonts";
import assets from "../src/font-assets.json" with { type: "json" };
import { exportCSS, generatePalette, normalize } from "../src/palette";

describe("font pairing export", () => {
  it("migrates legacy/invalid settings and preserves saved selections", () => {
    for (const value of [undefined, null, {}, "unknown", "__proto__"]) {
      assert.equal(normalize({ fontPairing: value }).fontPairing, "studio");
    }
    for (const pair of FONT_PAIRINGS) {
      const original = generatePalette({ fontPairing: pair.id, hue: 359.9999 });
      const restored = generatePalette(JSON.parse(JSON.stringify(original.values)));
      assert.deepEqual(restored, original);
      assert.equal(original.values.hue, 0);
    }
  });

  it("normalizes body x-height and display cap height without changing the shared size scale", () => {
    // Independent metrics from the bundled font files (OS/2 table, units / em).
    const metrics = {
      geist: [0.53, 0.722], studio: [0.526, 0.7], editorial: [0.54, 0.67],
      atelier: [0.51, 0.72], library: [0.452, 0.637], humanist: [0.478, 0.67],
    };
    for (const pair of FONT_PAIRINGS) {
      const [xHeight, capHeight] = metrics[pair.id];
      assert.ok(Math.abs(xHeight * fontSizeAdjust(pair.sans) / 100 - 0.526) < 0.001);
      assert.ok(Math.abs(capHeight * fontSizeAdjust(pair.serif) / 100 - 0.7) < 0.001);
    }
    assert.equal(fontSizeAdjust("Geist Mono"), 100);
  });

  it("exports only selected families, real styles, and existing licensed files", () => {
    for (const pair of FONT_PAIRINGS) {
      const palette = generatePalette({ fontPairing: pair.id });
      const css = exportCSS(palette);
      assert.ok(css.includes(`--font-sans: "${pair.sans}"`));
      assert.ok(css.includes(`--font-serif: "${pair.serif}"`));
      assert.ok(css.includes(`--font-display: "${pair.serif}"`));
      assert.ok(css.includes(`--leading-display: ${pair.displayLeading};`));
      assert.doesNotMatch(css, /--tracking-|--text-(?:base|sm|lg)|line-height:|letter-spacing:/);
      for (const asset of fontAssets(pair.id)) {
        assert.ok(css.includes(`src: url("/fonts/${asset.file}") format("woff2")`));
        assert.ok(css.includes(`font-weight: ${asset.weight};\n  font-style: ${asset.style};`));
        assert.ok(css.includes(`size-adjust: ${fontSizeAdjust(asset.family)}%;`));
        assert.ok(allFontFaces().includes(`size-adjust: ${fontSizeAdjust(asset.family)}%;`));
        assert.equal(readFileSync(new URL(`../public/fonts/${asset.file}`, import.meta.url)).subarray(0, 4).toString(), "wOF2");
        assert.match(readFileSync(new URL(`../public/fonts/${asset.license}`, import.meta.url), "utf8"), /SIL OPEN FONT LICENSE/);
      }
      for (const other of FONT_PAIRINGS.filter(other => other.id !== pair.id)) {
        assert.ok(!css.includes(`font-family: "${other.sans}"`));
        assert.ok(!css.includes(`font-family: "${other.serif}"`));
      }
    }
    for (const asset of assets) {
      const bytes = readFileSync(new URL(`../public/fonts/${asset.file}`, import.meta.url));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    }
  });
});
