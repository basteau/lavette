import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import { strFromU8, unzipSync } from 'fflate';
import { FONT_PAIRINGS, fontAssets } from '../src/fonts';
import { generatePalette, exportCSS } from '../src/palette';
import { createThemePackage } from '../src/theme-package';

it('ships complete, independently extractable themes for every font pairing and framework', async () => {
  for (const pair of FONT_PAIRINGS) for (const target of ['nuxt', 'vue'] as const) {
    const palette = generatePalette({ fontPairing: pair.id, uiSize: 'lg' });
    const files = unzipSync(await createThemePackage(palette, target, async path =>
      new Uint8Array(await readFile(new URL(`../public/${path}`, import.meta.url))),
    ));
    const css = strFromU8(files['lavette-theme.css']);
    assert.equal(css, exportCSS(palette));
    assert.deepEqual(JSON.parse(strFromU8(files['lavette-theme.json'])), palette.values);
    for (const asset of fontAssets(pair.id)) {
      assert.ok(files[`public/fonts/${asset.file}`].length > 100);
      assert.match(strFromU8(files[`public/fonts/${asset.license}`]), /OPEN FONT LICENSE/i);
    }
    for (const match of css.matchAll(/url\("\/([^" ]+)"\)/g)) assert.ok(files[`public/${match[1]}`], match[1]);
    assert.match(strFromU8(files['lavette-ui.config.ts']), target === 'nuxt' ? /defineAppConfig/ : /@nuxt\/ui\/vite/);
    assert.match(strFromU8(files['README.md']), /not auto-loaded/);
  }
});

it('rejects incomplete asset downloads instead of producing a broken archive', async () => {
  await assert.rejects(createThemePackage(generatePalette({}), 'nuxt', async () => {
    throw new Error('Asset unavailable');
  }), /Asset unavailable/);
});
