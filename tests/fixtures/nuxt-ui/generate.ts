import { mkdirSync, writeFileSync } from "node:fs";
import { generatePalette } from "../../../src/palette";
import { exportCSS } from "../../../src/theme";
import { presets } from "./presets";

writeFileSync(new URL("./lavette-theme.css", import.meta.url), exportCSS(generatePalette(presets.default)));
mkdirSync(new URL("./public/themes/", import.meta.url), { recursive: true });
for (const [name, values] of Object.entries(presets)) {
  writeFileSync(new URL(`./public/themes/${name}.css`, import.meta.url), exportCSS(generatePalette(values)));
}