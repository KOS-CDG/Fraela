# Fraela 2026 film

The birthday film shown on the 2026 page, made with [Remotion](https://www.remotion.dev).

```
npm ci
npm run dev      # preview and edit in Remotion Studio
npm run render   # writes ../public/media/2026/film/fraela-2026.mp4
npm run poster   # writes ../public/media/2026/film/fraela-2026-poster.webp
```

- The words and photos come from `../src/gallery-2026.json`, the same file the page uses. Every photo appears.
- The film is cut to the music, 120 BPM at 30 fps: a beat is 15 frames and a bar is 60. `src/timeline.ts` puts each scene on a bar: the intro stabs, the drop at 8 s, the break at 23 s, the chorus at 24 s and the last hit at 40 s.
- `src/scenes/` has one file per scene, and each plays its own sound effects from `src/audio/`. `src/Fraela2026.tsx` joins them and adds the music. In the Studio, the Fraela2026-Scenes folder previews each scene with its part of the music.
- Motion is shared between the two libraries. Remotion keeps the clock, cuts the scenes, places every sound and draws the whip-pan motion blur, the sunbursts and the confetti cannons. anime.js moves the letters, stickers, prints and tiles: `src/lib/anime.ts` builds a paused anime.js timeline once and seeks it to the current frame, so every frame renders the same way in any order. Elements anime.js moves get their starting look from CSS, and React never sets their transform or opacity.
- The music and the impact, pop, riser, cheer, whoosh, sparkle and confetti sounds were generated with ElevenLabs for this film. The shutter, chime, whip and paper sounds come from remotion.media.

Remotion is free for individuals and small teams. See its [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
