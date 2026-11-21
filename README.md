# To My Fairest Love

Run `npm ci` and `npm run dev`. Use `npm run build` to create the static site in `dist/`.

- `index.html` contains the stationary year selector.
- `2025/index.html` and `public/archive-media/` contain the original birthday archive. Menus use simple labels and solid colors, and playback starts through the media controls.
- `2026/index.html` is the 2026 scroll story: every unique photo from the 2026 PDF, in PDF order, with a live counter, chapters, a full-screen viewer and a heart mosaic finale.
- `archive/index.html` is the monthly Creativity archive. It opens through the Archive link on the home page and both year pages.

## Creativity archive

To rebuild the monthly archive, install Pillow with WebP support and run:

```
python tools/build_creativity_archive.py path/to/Phone_Exact_Order
```

The importer reads the sequence and local timestamp in each filename. It leaves the export intact and replaces the generated manifest at `src/creativity-archive.json` and web media in `public/media/creativity/`. The generated files are used by the normal Vite build, so the source export is only needed to rebuild them.

## 2026 photos

The photos come from `Fraela_pics_compressed.pdf` (one photo per page). To rebuild them, install poppler (`pdfimages`) and Pillow, then run:

```
python3 tools/build_gallery_2026.py path/to/Fraela_pics_compressed.pdf
```

It writes `public/media/2026/gallery/` (720 px and 1280 px WebP files plus `mosaic.webp`) and the manifest `src/gallery-2026.json`. A photo that already appeared on an earlier page is shown only once, at its first page; the skipped pages are listed under `skipped` in the manifest. The script stops if any page is unaccounted for or out of order.

- **Chapter titles:** edit `src/chapters-2026.js`. Each chapter starts at a photo number; the titles are placeholders.
- **Layouts:** chapters are cut into blocks. Bursts of near-identical shots become flip-books; other blocks take turns between spread, drifting columns, film strip and scatter.
- **Films:** set a video's `src`, `poster`, optional `captions` (WebVTT) and `label` in `src/memories-2026.js`. Leave a source empty to keep its placeholder frame. Videos go under `public/media/2026/` and are addressed as `../media/2026/filename.mp4`.
- **Closing letter:** set `closingLetter` in `src/memories-2026.js`.
- **Checks:** `npm run build && npx playwright test` confirms every photo renders, in order, and loads.

Preview with sound off, with reduced motion, and on a real phone before sharing.
