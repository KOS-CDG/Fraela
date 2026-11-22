# Fraela 2026 film

The birthday film shown on the 2026 page, made with [Remotion](https://www.remotion.dev).

```
npm ci
npm run dev      # preview and edit in Remotion Studio
npm run render   # writes ../public/media/2026/film/fraela-2026.mp4
npm run poster   # writes ../public/media/2026/film/fraela-2026-poster.webp
```

- The words and photos come from `../src/gallery-2026.json`, the same file the page uses. Photos marked `"film": true` appear here.
- `src/timeline.ts` holds the size and the length of each scene.
- `src/scenes/` has one file per scene. Each scene plays its own sound effects from `src/audio/`; `src/Fraela2026.tsx` joins them and adds the music.
- The music and the whoosh, sparkle and confetti sounds were generated with ElevenLabs for this film. The shutter and chime come from remotion.media.

Remotion is free for individuals and small teams. See its [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
