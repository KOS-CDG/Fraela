# Fraela 2026 film

The birthday film shown on the 2026 page, made with [Remotion](https://www.remotion.dev).

```
npm ci
npm run dev      # preview and edit in Remotion Studio
npm run render   # writes ../public/media/2026/film/fraela-2026.mp4
npm run poster   # writes ../public/media/2026/film/fraela-2026-poster.webp
```

- The words and photos come from `../src/gallery-2026.json`, the same file the page uses. Every photo appears.
- The film is cut to "Lifetime" by Ben&Ben, 90 BPM at 30 fps: a beat is 20 frames and a bar is 80. `src/timeline.ts` puts each scene on a bar: four bars of intro, the band coming in at 10.7 s, the chorus at 48 s, and a fade over the last bar to 72 s. The song's first downbeat is 0.41 s into the file, so the film starts `MUSIC_START` frames in.
- `src/scenes/` has one file per scene, and each plays its own sound effects from `src/audio/`. `src/Fraela2026.tsx` joins them and adds the music. In the Studio, the Fraela2026-Scenes folder previews each scene with its part of the music.
- Motion is shared between the two libraries. Remotion keeps the clock, cuts the scenes, places every sound and draws the whip-pan motion blur, the sunbursts and the confetti cannons. anime.js moves the letters, stickers, prints and tiles: `src/lib/anime.ts` builds a paused anime.js timeline once and seeks it to the current frame, so every frame renders the same way in any order. Elements anime.js moves get their starting look from CSS, and React never sets their transform or opacity.
- The music is the first 74 s of "Lifetime" by Ben&Ben, a commercial recording used for this personal gift only. The impact, pop, riser, cheer, whoosh, sparkle and confetti sounds were generated with ElevenLabs for this film. The shutter, chime, whip and paper sounds come from remotion.media.

Remotion is free for individuals and small teams. See its [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
