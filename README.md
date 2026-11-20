# To My Fairest Love

Run `npm ci` and `npm run dev`. Use `npm run build` to create the static site in `dist/`.

- `index.html` contains the stationary year selector.
- `2025/index.html` and `public/archive-media/` contain the original birthday archive. Menus use simple labels and solid colors, and playback starts through the media controls.
- `src/memories-2026.js` contains the eight 2026 scenes and all media slots.

## Add 2026 memories

1. Put new files under `public/media/2026/`. From the 2026 page, a file in that directory is addressed as `../media/2026/filename.webp` or `../media/2026/filename.mp4`. Use web-friendly images, and export compatible video such as MP4 with H.264 and AAC.
2. Set the photo's `src`, `alt`, `aspect`, and `focalPoint` in the content file. The focal point uses CSS percentages. Keep the slot ID if you want to preserve its original composition.
3. Set a video's `src`, `poster`, `aspect`, and optional `captions` (WebVTT) and `label`. On a still-to-film transition the still and video can share matching framing and a focal point.
4. Set each optional `title` or `caption` where it belongs; use `letter` on the closing scene. The order of the objects in `memories` sets the chapter order. Leave unfilled sources as empty strings to keep their placeholder frames.
5. Preview with sound off, with reduced motion, and on a real phone before sharing.
