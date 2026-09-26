import googleFonts from "./google-fonts.json" with { type: "json" };

const faces = googleFonts.flatMap(family => family.faces);

export const FONT_PAIRINGS = [
  { id: "geist", sansAdjust: 99.2, displayAdjust: 97, name: "Geist", serif: "Geist Pixel Square", sans: "Geist", displayLeading: 1.25, description: "Pixel-built headlines with the clean, precise Geist interface family." },
  { id: "studio", sansAdjust: 100, displayAdjust: 100, name: "Studio", serif: "Fraunces", sans: "DM Sans", displayLeading: 1.25, description: "Soft, expressive headlines with a calm, geometric foundation." },
  { id: "editorial", sansAdjust: 97.4, displayAdjust: 104.5, name: "Editorial", serif: "Newsreader", sans: "Manrope", displayLeading: 1.25, description: "Literary headlines with crisp, contemporary interface text." },
  { id: "atelier", sansAdjust: 103.1, displayAdjust: 97.2, name: "Atelier", serif: "Instrument Serif", sans: "Instrument Sans", displayLeading: 1.3, description: "Elegant, high-contrast display type with its versatile sans companion." },
  { id: "library", sansAdjust: 116.4, displayAdjust: 109.9, name: "Library", serif: "Alegreya", sans: "Alegreya Sans", displayLeading: 1.25, description: "A calligraphic serif and its humanist sans companion, designed together for reading." },
  { id: "humanist", sansAdjust: 110, displayAdjust: 104.5, name: "Humanist", serif: "Source Serif 4", sans: "Source Sans 3", displayLeading: 1.25, description: "Adobe’s complementary serif and sans families for a quietly assured voice." },
] as const;
/** Normalize the font faces, not individual components or Tailwind's size scale.
 * Sans faces target DM Sans's 0.526em x-height; display faces target Fraunces's
 * 0.700em cap height. Values were verified against Google-hosted fonts' OS/2 metrics and are
 * rounded to 0.1%. Keep each family's real weight/italic and natural proportions.
 * https://www.w3.org/TR/css-fonts-5/#descdef-font-face-size-adjust
 */
export function fontSizeAdjust(family: string): number {
  const pair = FONT_PAIRINGS.find(pair => pair.sans === family || pair.serif === family);
  return pair ? pair.sans === family ? pair.sansAdjust : pair.displayAdjust : 100;
}
export const DEFAULT_FONT_PAIRING = "studio";
export function fontPairing(id: unknown) {
  return FONT_PAIRINGS.find(pair => pair.id === id) ?? FONT_PAIRINGS.find(pair => pair.id === DEFAULT_FONT_PAIRING)!;
}
export function fontFacesForPairing(id: unknown) {
  const pair = fontPairing(id);
  return faces.filter(face => [pair.sans, pair.serif, "Geist Mono"].includes(face.family));
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
function renderFontFaces(selected: ReturnType<typeof fontFacesForPairing>): string {
  return selected.map(face => `@font-face {
  font-family: "${face.family}";
  src: url("${face.url}") format("woff2");
  font-weight: ${face.weight};
  font-style: ${face.style};
  font-display: swap;
  size-adjust: ${fontSizeAdjust(face.family)}%;${face.family === "Geist Pixel Square" ? '\n  font-variation-settings: "ELSH" 1;' : ""}
  unicode-range: ${face.unicodeRange};
}`).join("\n\n");
}

/** Display-only opt-in. Body/controls retain their native size and spacing scale; font-face size-adjust
 * normalizes the perceived size of each pairing.
 * Most pairs use Tailwind's leading-tight value. Instrument Serif's tall accents
 * need additional room. Tracking stays normal; optical spacing remains automatic.
 */
export function typographyTokens(id: unknown): Record<"--leading-display", string> {
  return { "--leading-display": String(fontPairing(id).displayLeading) };
}

export function fontFaces(id: unknown): string {
  return renderFontFaces(fontFacesForPairing(id));
}

// Register once; changing a color must never detach loaded FontFace objects.
export function allFontFaces(): string {
  return renderFontFaces(faces);
}

/** Warm the selected styles without delaying editing or export. Only Latin faces are
 * preloaded; the browser fetches other Unicode subsets when the page needs them. */
export async function loadFontPairing(
  id: unknown,
  fontSet: Pick<FontFaceSet, "load"> = document.fonts,
  timeoutMs = 8000,
): Promise<void> {
  const requests = [...new Set(fontFacesForPairing(id).map(face =>
    `${face.style} ${face.weight.split(" ")[0]} 16px "${face.family}"`,
  ))];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all(requests.map(async request => {
        const loaded = await fontSet.load(request, "BESbswy");
        if (!loaded.length) throw new Error("Font face unavailable");
      })),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Font loading timed out")), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
