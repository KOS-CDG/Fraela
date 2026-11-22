# To My Fairest Love

Run `npm ci` and `npm run dev`. Use `npm run build` to create the static site in `dist/`.

- `index.html` contains the stationary year selector.
- `2025/index.html` and `public/archive-media/` contain the original birthday archive. Menus use simple labels and solid colors, and playback starts through the media controls.
- `2026/index.html` is the 2026 gallery: the best formal photos of Fraela in four chapters, with notes, a birthday film and parallax scrolling built with anime.js.
- `archive/index.html` is the monthly Creativity archive. It opens through the Archive link on the home page and both year pages.

## Creativity archive

To rebuild the monthly archive, install Pillow with WebP support and run:

```
python tools/build_creativity_archive.py path/to/Phone_Exact_Order
```

The importer reads the sequence and local timestamp in each filename. It leaves the export intact and replaces the generated manifest at `src/creativity-archive.json` and web media in `public/media/creativity/`. The generated files are used by the normal Vite build, so the source export is only needed to rebuild them.

## 2026 gallery

All the words and the photo choices live in `src/gallery-2026.json`: the intro, each chapter's title and message, every photo's caption and description, the film's lines and the closing note. Edit that file and both the page and the film follow. The section colours are in `src/gallery-2026-tones.json`.

To rebuild the photos after changing the selection, install Pillow with WebP support and `pdfimages` (poppler-utils), then run:

```
python3 tools/build_gallery_2026.py path/to/Fraela_pics_compressed.pdf
```

The tool takes the listed pages from the PDF, writes a large and a small WebP of each to `public/media/2026/photos/`, removes photos that are no longer listed and records their sizes in `src/gallery-2026-photos.json`.

## 2026 film

The film is a Remotion project in `video/`. It reads the same content file and the photos in `public/media/2026/`, and shows all 25 photos. It is cut to "Lifetime" by Ben&Ben (90 BPM): every scene starts on a bar of the song and every photo lands on a beat. Remotion keeps time, places the sound and adds the camera motion blur; anime.js does the bouncing letters, staggers, line drawing and the photo heart.

```
cd video
npm ci
npm run dev      # preview and edit in Remotion Studio
npm run render   # writes public/media/2026/film/fraela-2026.mp4
npm run poster   # writes public/media/2026/film/fraela-2026-poster.webp
```

Scene starts are in `video/src/timeline.ts`, in bars of the song: four bars of intro, the band coming in at 10.7 s and the chorus at 48 s. A different song needs new values for `BEAT`, `MUSIC_START` and the scene lengths.

Sound: the music is the first 74 seconds of "Lifetime" by Ben&Ben (`video/src/audio/lifetime.mp3`), a commercial recording used here for a personal gift and not licensed for any other use. The impact, pop, riser, cheer, whoosh, sparkle and confetti effects were generated for this film with ElevenLabs. The shutter, chime, whip and paper sounds come from Remotion's sound library at remotion.media.
