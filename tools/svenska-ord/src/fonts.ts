import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fonts are bundled in public/fonts (OFL, from Fontsource) so batch renders
 * work offline and are identical on every machine. loadFont() blocks the
 * render until each file is ready.
 */
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
// Includes IPA characters used in phonetics (ˈ ː ɑ ɡ ɔ …).
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

const DISPLAY = "SO Montserrat";
const UI = "SO Inter";
const ARABIC = "SO IBM Plex Sans Arabic";

const latinPair = (family: string, file: string, weight: string) => {
  loadFont({
    family,
    weight,
    url: staticFile(`fonts/${file}-latin-${weight}-normal.woff2`),
    unicodeRange: LATIN,
  });
  loadFont({
    family,
    weight,
    url: staticFile(`fonts/${file}-latin-ext-${weight}-normal.woff2`),
    unicodeRange: LATIN_EXT,
  });
};

latinPair(DISPLAY, "montserrat", "900");
for (const w of ["400", "500", "600"]) {
  latinPair(UI, "inter", w);
}
for (const w of ["400", "600", "700"]) {
  loadFont({
    family: ARABIC,
    weight: w,
    url: staticFile(`fonts/ibm-plex-sans-arabic-arabic-${w}-normal.woff2`),
  });
}

export const displayFont = `"${DISPLAY}", "Arial Black", sans-serif`;
export const uiFont = `"${UI}", "Helvetica Neue", Arial, sans-serif`;
export const arabicFont = `"${ARABIC}", "${UI}", sans-serif`;
