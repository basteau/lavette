import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createRequire } from 'node:module';
import { ICON_SETS, iconPresets, normalizeIconSet } from '../src/icons';
import { normalize, randomValues } from '../src/palette';
import { exportUiConfig } from '../src/ui-config';
const require = createRequire(import.meta.url);

it('provides complete icon presets backed by installed outline collections', () => {
  for (const { value } of ICON_SETS) {
    const collection = require(`@iconify-json/${value}/icons.json`);
    assert.equal(Object.keys(iconPresets[value].ui).length, 43);
    assert.deepEqual(Object.keys(iconPresets[value].ui), Object.keys(iconPresets.lucide.ui));
    for (const icon of Object.values(iconPresets[value].icons)) {
      const [prefix, name] = icon.split(':');
      assert.equal(prefix, value);
      let resolved = name;
      const visited = new Set<string>();
      while (collection.aliases?.[resolved]) {
        assert.ok(!visited.has(resolved), `Alias cycle: ${icon}`);
        visited.add(resolved);
        resolved = collection.aliases[resolved].parent;
      }
      assert.ok(collection.icons[resolved]?.body, `Missing icon: ${icon}`);
      assert.ok(!/-solid|-mini|-micro|-filled/.test(name), `Not outline: ${icon}`);
    }
  }
});
it('restores old settings to Lucide and retains each supported selection', () => {
  for (const value of [undefined, null, {}, 'unknown', '__proto__']) assert.equal(normalizeIconSet(value), 'lucide');
  assert.equal(normalize({}).iconSet, 'lucide');
  for (const { value } of ICON_SETS) {
    const saved = JSON.parse(JSON.stringify(normalize({ iconSet: value })));
    assert.equal(normalize(saved).iconSet, value);
    assert.equal(randomValues(saved).iconSet, value);
  }
});
it('exports only the selected preset with its derived bundle', () => {
  for (const { value } of ICON_SETS) {
    const output = exportUiConfig(normalize({ iconSet: value }));
    for (const icon of Object.values(iconPresets[value].ui)) assert.ok(output.includes(icon));
    for (const other of ICON_SETS.filter(set => set.value !== value)) assert.ok(!output.includes(`${other.value}:`));
    assert.match(output, /Object.values\(uiTheme.icons\)/);
  }
});
