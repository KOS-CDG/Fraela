# To My Fairest Love

Run `npm ci` and `npm run dev`. Use `npm run build` to create the static site in `dist/`.

- `index.html` contains the stationary year selector.
- `2025/index.html` and `public/archive-media/` contain the original birthday archive. Menus use simple labels and solid colors, and playback starts through the media controls.
- `2026/index.html` is the 2026 page with site navigation.
- `archive/index.html` is the monthly Creativity archive. It opens through the Archive link on the home page and both year pages.

## Creativity archive

To rebuild the monthly archive, install Pillow with WebP support and run:

```
python tools/build_creativity_archive.py path/to/Phone_Exact_Order
```

The importer reads the sequence and local timestamp in each filename. It leaves the export intact and replaces the generated manifest at `src/creativity-archive.json` and web media in `public/media/creativity/`. The generated files are used by the normal Vite build, so the source export is only needed to rebuild them.
