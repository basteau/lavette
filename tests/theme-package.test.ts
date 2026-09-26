import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import { strFromU8, unzipSync } from 'fflate';
import { FONT_PAIRINGS, fontAssets } from '../src/fonts';
import { generatePalette, exportCSS } from '../src/palette';
import { createThemePackage } from '../src/theme-package';

it('ships complete, independently extractable themes for every font pairing', async () => {
  for (const pair of FONT_PAIRINGS) {
    const palette = generatePalette({ fontPairing: pair.id });
    const files = unzipSync(await createThemePackage(palette, async path =>
      new Uint8Array(await readFile(new URL(`../public/${path}`, import.meta.url))),
    ));
    const css = strFromU8(files['lavette-theme.css']);
    assert.equal(css, exportCSS(palette));
    assert.deepEqual(Object.keys(files).filter(path => !path.startsWith('public/fonts/')).sort(), ['README.md', 'lavette-theme.css']);
    for (const asset of fontAssets(pair.id)) {
      assert.ok(files[`public/fonts/${asset.file}`].length > 100);
      assert.match(strFromU8(files[`public/fonts/${asset.license}`]), /OPEN FONT LICENSE/i);
    }
    for (const match of css.matchAll(/url\("\/([^" ]+)"\)/g)) assert.ok(files[`public/${match[1]}`], match[1]);
    assert.match(strFromU8(files['README.md']), /Nuxt UI's default control sizes are preserved/);
  }
});

it('rejects incomplete asset downloads instead of producing a broken archive', async () => {
  await assert.rejects(createThemePackage(generatePalette({}), async () => {
    throw new Error('Asset unavailable');
  }), /Asset unavailable/);
});
