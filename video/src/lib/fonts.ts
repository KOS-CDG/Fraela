import { loadFont } from "@remotion/fonts";
import serifItalic from "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2";
import serifRegular from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2";
import sans from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2";

// The same typefaces as the website. loadFont holds each frame until the font is ready.
export const SERIF = '"Instrument Serif", Georgia, serif';
export const SANS = '"DM Sans", system-ui, sans-serif';

loadFont({ family: "Instrument Serif", url: serifRegular, weight: "400" });
loadFont({
  family: "Instrument Serif",
  url: serifItalic,
  weight: "400",
  style: "italic",
});
loadFont({ family: "DM Sans", url: sans, weight: "100 1000" });
