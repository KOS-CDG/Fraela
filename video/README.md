# Fraela 2026 film

The birthday film shown on the 2026 page, made with [Remotion](https://www.remotion.dev) and [anime.js](https://animejs.com).

```
npm ci
npm run dev      # preview and edit in Remotion Studio
npm run render   # writes ../public/media/2026/film/fraela-2026.mp4
npm run poster   # writes ../public/media/2026/film/fraela-2026-poster.webp
```

## The story

A phone buzzes at 11:59 and its clock flips to midnight on the song's first chord. A postcard arrives; she taps it and the camera dives in. The card turns over, writes its message and is postmarked at midnight, then flies off as the band comes in. Postcards take off, a paper plane draws an arrow through a heart across the night, the moon rises with her face in it, the nights of the year flick past and the stars join into a heart. A heartbeat fills a heart with her photos, footsteps cross a map to her, the curtains open on the portrait of the year, sparks gather into a heart in the firelight, and the postcard comes out of the flare stamped Delivered. Fireworks for her birthday night, and the camera pulls back out of the phone it all happened in: 12:01, opened just now, screen off.

## Timing

- The song is exactly 60 BPM: at 30 fps a beat is 30 frames and a bar is 120. Its first downbeat is 0.136 s into the recording. `src/timeline.ts` has the bars and the scenes.
- One beat of sound effects comes first (the cold open), so the song's first chord lands on frame 30.
- The film plays bars 0 to 17 of the song (the intro, first verse and first chorus), then jumps to bar 52 (the end of the last chorus) and the outro. Both bars have the same chords, and the cut is on the bar line during a held note, with a four-frame crossfade. `songBar(n)` gives the film frame of any bar on either side of the jump.
- The song plays from the phone's speaker until the camera dives into the postcard, and goes back into the phone when the camera pulls out at the end (equal-power crossfades in `src/Fraela2026.tsx`). The music dips for a moment under three loud effects: the heart slam, the fire and the Delivered stamp.
- Each scene starts on a bar line, and the big moments inside a scene are timed to the words they illustrate. The pictures follow the song's imagery; no lyrics appear on screen.

## Code

- `src/scenes/` has one file per scene, and each plays its own sound effects from `src/audio/`. `src/Fraela2026.tsx` joins them and adds the music. In the Studio, the Fraela2026-Scenes folder previews each scene with its part of the music.
- The words come from `../src/gallery-2026.json`, the same file the page uses (its `film` section). Photos are named by their page in Fraela_pics_compressed.pdf: `src/lib/photos.ts` serves the page's copy of a photo on the 2026 page, or the film's own copy from `src/photos/` (made with `../tools/build_film_photos.py`).
- Motion is shared between the two libraries. anime.js does the choreography: entrances, slams, flips, stamps, curtains and camera moves. `src/lib/anime.ts` builds a paused anime.js timeline once and seeks it to the current frame, so every frame renders the same way in any order. Elements that anime.js moves exist on every frame, get their starting look from CSS, and React never sets their transform or opacity. Remotion keeps the clock and draws whatever follows a formula of the frame: the paper plane's path, the heart monitor, the map walk, the counters, and the flames, sparks and fireworks on a canvas (`src/lib/Canvas.tsx`).

## Sound

- The music is "Last Night on Earth" by Green Day, a commercial recording used for this personal gift only. `last-night-a.mp3` is the song's first 73.6 s and `last-night-b.mp3` the 26.5 s from 206 s, both cut with ffmpeg's stream copy; b's first sample is 205.98857 s into the song (measured by cross-correlation).
- The phone-speaker versions are the song's first 10 s and the 16 s from 216 s, filtered with `highpass=f=480,highpass=f=480,lowpass=f=3600,lowpass=f=3600,equalizer=f=1700:t=q:w=1.1:g=5,acompressor=threshold=0.08:ratio=3:attack=4:release=90:makeup=2`, mono at 16 kHz.
- The fire, crackle, fireworks, sparkler, footstep, impact, pop, riser, whoosh and sparkle sounds were generated with ElevenLabs for this film. The heartbeat, phone buzz, tap, flip clock, stamp and pen sounds are synthesised by `../tools/synth_film_sfx.py`. The shutter, chime, whip and paper sounds come from remotion.media.

Remotion is free for individuals and small teams. See its [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
