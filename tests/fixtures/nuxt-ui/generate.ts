import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { exportCSS, generatePalette } from "../../../src/palette";

writeFileSync(new URL("./lavette-theme.css", import.meta.url), exportCSS(generatePalette({ recipe: "soft", hue: 210, mood: 70, depth: 50 })));
mkdirSync(new URL("./public/fonts/", import.meta.url), { recursive: true });
cpSync(new URL("../../../public/fonts/", import.meta.url), new URL("./public/fonts/", import.meta.url), { recursive: true });
