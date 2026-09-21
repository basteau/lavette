import assets from "./font-assets.json" with { type: "json" };

export const FONT_PAIRINGS = [
  { id: "geist", name: "Geist", serif: "Geist Pixel Square", sans: "Geist", displayLeading: 1.25, description: "Pixel-built headlines with the clean, precise Geist interface family." },
  { id: "studio", name: "Studio", serif: "Fraunces", sans: "DM Sans", displayLeading: 1.25, description: "Soft, expressive headlines with a calm, geometric foundation." },
  { id: "editorial", name: "Editorial", serif: "Newsreader", sans: "Manrope", displayLeading: 1.25, description: "Literary headlines with crisp, contemporary interface text." },
  { id: "atelier", name: "Atelier", serif: "Instrument Serif", sans: "Instrument Sans", displayLeading: 1.3, description: "Elegant, high-contrast display type with its versatile sans companion." },
  { id: "library", name: "Library", serif: "Alegreya", sans: "Alegreya Sans", displayLeading: 1.25, description: "A calligraphic serif and its humanist sans companion, designed together for reading." },
  { id: "humanist", name: "Humanist", serif: "Source Serif 4", sans: "Source Sans 3", displayLeading: 1.25, description: "Adobe’s complementary serif and sans families for a quietly assured voice." },
] as const;
export const DEFAULT_FONT_PAIRING = "studio";
export function fontPairing(id: unknown) {
  return FONT_PAIRINGS.find(pair => pair.id === id) ?? FONT_PAIRINGS.find(pair => pair.id === DEFAULT_FONT_PAIRING)!;
}
const mono = { family: "Geist Mono", file: "geist-mono-normal.woff2", weight: "400 600", style: "normal", license: "geistmono-OFL.txt" };
export function fontAssets(id: unknown) {
  const pair = fontPairing(id);
  return [...assets.filter(asset => asset.family === pair.sans || asset.family === pair.serif), mono];
}
export function fontTokens(id: unknown): Record<`--font-${string}`, string> {
  const pair = fontPairing(id);
  return {
    "--font-sans": `"${pair.sans}", system-ui, sans-serif`,
    "--font-serif": `"${pair.serif}", Georgia, serif`,
    "--font-display": `"${pair.serif}", Georgia, serif`,
    "--font-mono": '"Geist Mono", monospace',
  };
}
function renderFontFaces(selected: ReturnType<typeof fontAssets>): string {
  return selected.map(asset => `@font-face {
  font-family: "${asset.family}";
  src: url("/fonts/${asset.file}") format("${asset.file.endsWith('.woff2') ? 'woff2' : 'truetype'}");
  font-weight: ${asset.weight};
  font-style: ${asset.style};
  font-display: swap;
}`).join("\n\n");
}

/** Display-only opt-in. Body/controls retain their native typography defaults.
 * Most pairs use Tailwind's leading-tight value. Instrument Serif's tall accents
 * need additional room. Tracking stays normal; optical spacing remains automatic.
 */
export function typographyTokens(id: unknown): Record<"--leading-display", string> {
  return { "--leading-display": String(fontPairing(id).displayLeading) };
}
export const DISPLAY_CLASSES = "font-display font-normal leading-display tracking-normal";

export function fontFaces(id: unknown): string {
  return renderFontFaces(fontAssets(id));
}

// Register once; changing a color must never detach loaded FontFace objects.
export function allFontFaces(): string {
  return renderFontFaces([...assets, mono]);
}

export async function loadFontPairing(id: unknown): Promise<void> {
  await Promise.all(fontAssets(id).map(asset =>
    document.fonts.load(`${asset.style} ${asset.weight.split(" ")[0]} 16px "${asset.family}"`),
  ));
}
