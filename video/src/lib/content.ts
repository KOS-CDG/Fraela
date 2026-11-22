import { staticFile } from "remotion";
// The film reads the same hand-edited content and colours as the 2026 page.
import gallery from "../../../src/gallery-2026.json";
import tones from "../../../src/gallery-2026-tones.json";

export type Chapter = (typeof gallery.chapters)[number];
export type Photo = Chapter["photos"][number];
export type ChapterId = "bloom" | "stone" | "gold" | "white";
export type Tone = { bg: string; ink: string; accent: string };

export const content = gallery;
export const TONES: Record<keyof typeof tones, Tone> = tones;

export const getChapter = (id: ChapterId): Chapter => {
  const chapter = gallery.chapters.find((c) => c.id === id);
  if (!chapter) {
    throw new Error(`There is no chapter "${id}" in src/gallery-2026.json`);
  }
  return chapter;
};

// Every photo on the page, in page order.
export const allPhotos: Photo[] = gallery.chapters.flatMap(
  (chapter) => chapter.photos,
);

export const photoSrc = (page: number) =>
  staticFile(`photos/${String(page).padStart(4, "0")}-l.webp`);
