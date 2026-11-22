import { staticFile } from "remotion";
import p0140 from "../photos/0140.webp";
import p0186 from "../photos/0186.webp";
import p0213 from "../photos/0213.webp";
import p0410 from "../photos/0410.webp";
import p0414 from "../photos/0414.webp";
import p0427 from "../photos/0427.webp";
import p0439 from "../photos/0439.webp";
import p0443 from "../photos/0443.webp";
import p0444 from "../photos/0444.webp";
import p0448 from "../photos/0448.webp";
import p0455 from "../photos/0455.webp";
import p0555 from "../photos/0555.webp";
import p0565 from "../photos/0565.webp";
import p0617 from "../photos/0617.webp";
import p0836 from "../photos/0836.webp";
import p0867 from "../photos/0867.webp";
import p0917 from "../photos/0917.webp";
import { allPhotos } from "./content";

// Photos from the same shoots that only the film uses. They live next to the
// film's code, not in the website's public folder (tools/build_film_photos.py).
const EXTRA: Record<number, string> = {
  140: p0140,
  186: p0186,
  213: p0213,
  410: p0410,
  414: p0414,
  427: p0427,
  439: p0439,
  443: p0443,
  444: p0444,
  448: p0448,
  455: p0455,
  555: p0555,
  565: p0565,
  617: p0617,
  836: p0836,
  867: p0867,
  917: p0917,
};

const ON_PAGE = new Set(allPhotos.map((photo) => photo.page));

// The URL of a photo by its page in Fraela_pics_compressed.pdf: the website's
// copy for photos on the 2026 page, the film's own copy for the extras.
export const photo = (page: number): string => {
  if (ON_PAGE.has(page)) {
    return staticFile(`photos/${String(page).padStart(4, "0")}-l.webp`);
  }
  const extra = EXTRA[page];
  if (!extra) {
    throw new Error(`Photo ${page} is neither on the 2026 page nor a film extra`);
  }
  return extra;
};
