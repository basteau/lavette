import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FONT_PAIRINGS, fontFacesForPairing, fontSizeAdjust, allFontFaces, loadFontPairing } from "../src/fonts";
import googleFonts from "../src/google-fonts.json" with { type: "json" };
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

  it("exports only selected Google-hosted families with the complete style and subset declarations", () => {
    const all = allFontFaces();
    for (const pair of FONT_PAIRINGS) {
      const css = exportCSS(generatePalette({ fontPairing: pair.id }));
      assert.ok(css.includes(`--font-sans: "${pair.sans}"`));
      assert.ok(css.includes(`--font-display: "${pair.serif}"`));
      assert.ok(css.includes(`--leading-display: ${pair.displayLeading};`));
      assert.doesNotMatch(css, /url\("\/fonts\/|@import url|--text-(?:base|sm|lg)|letter-spacing:/);
      const selected = fontFacesForPairing(pair.id);
      assert.deepEqual([...new Set(selected.map(f => f.family))].sort(), [pair.sans, pair.serif, "Geist Mono"].sort());
      for (const face of selected) {
        assert.equal(new URL(face.url).origin, "https://fonts.gstatic.com");
        assert.ok(face.url.endsWith(".woff2"));
        assert.ok(css.includes(`src: url("${face.url}") format("woff2")`));
        assert.ok(css.includes(`font-weight: ${face.weight};\n  font-style: ${face.style};`));
        assert.ok(css.includes(`size-adjust: ${fontSizeAdjust(face.family)}%;`));
        assert.ok(css.includes(`unicode-range: ${face.unicodeRange};`));
        assert.ok(all.includes(`src: url("${face.url}")`));
      }
      for (const other of FONT_PAIRINGS.filter(other => other.id !== pair.id)) {
        assert.ok(!css.includes(`font-family: "${other.sans}"`));
        assert.ok(!css.includes(`font-family: "${other.serif}"`));
      }
      if (pair.id === "geist") assert.match(css, /font-variation-settings: "ELSH" 1/);
    }
  });

  it("retains real italics, weight ranges, optical sizes and Unicode subsets", () => {
    const expected = {
      Fraunces: "100 900", "DM Sans": "100 1000", Newsreader: "200 800", Manrope: "200 800",
      "Instrument Serif": "400", "Instrument Sans": "400 700", Alegreya: "400 900",
      "Source Serif 4": "200 900", "Source Sans 3": "200 900", Geist: "100 900", "Geist Mono": "400 600",
      "Geist Pixel Square": "400", "Alegreya Sans": "100|300|400|500|700|800|900",
    };
    for (const group of googleFonts) {
      const family = group.faces[0].family as keyof typeof expected;
      const weights = [...new Set(group.faces.map(f => f.weight))].sort().join("|");
      assert.equal(weights, expected[family]);
      const styles = [...new Set(group.faces.map(f => f.style))].sort();
      assert.deepEqual(styles, ["Manrope", "Geist Mono", "Geist Pixel Square"].includes(family) ? ["normal"] : ["italic", "normal"]);
      assert.ok(group.faces.some(f => f.unicodeRange.includes("U+0000-00FF")));
      assert.ok(group.faces.some(f => f.unicodeRange.includes("U+0100")));
      if (["Fraunces", "DM Sans", "Newsreader", "Source Serif 4"].includes(family)) {
        assert.ok(new URL(group.source).searchParams.get("family")!.includes("opsz"));
      }
    }
  });

  it("warms styles once across subsets and bounds failed or stalled font loads", async () => {
    const requests: string[] = [];
    await loadFontPairing("studio", { load: async request => { requests.push(request); return [{} as FontFace]; } });
    assert.equal(requests.length, new Set(requests).size);
    assert.equal(requests.length, 5); // two styles per family, plus mono
    await assert.rejects(loadFontPairing("studio", { load: async () => [] }), /unavailable/);
    await assert.rejects(loadFontPairing("studio", { load: async () => { throw new Error("offline"); } }), /offline/);
    await assert.rejects(loadFontPairing("studio", { load: () => new Promise(() => {}) }, 5), /timed out/);
  });
});
