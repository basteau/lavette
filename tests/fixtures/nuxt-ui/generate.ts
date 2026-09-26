import { rmSync, mkdirSync, writeFileSync } from "node:fs";
import { exportCSS, generatePalette } from "../../../src/palette";
import { presets } from "./presets";

writeFileSync(new URL("./lavette-theme.css", import.meta.url), exportCSS(generatePalette(presets.default)));
mkdirSync(new URL("./public/themes/", import.meta.url), { recursive: true });
for (const [name, values] of Object.entries(presets)) {
  writeFileSync(new URL(`./public/themes/${name}.css`, import.meta.url), exportCSS(generatePalette(values)));
}
// Clean the previous local-font fixture output.
rmSync(new URL("./public/fonts/", import.meta.url), { recursive: true, force: true });
