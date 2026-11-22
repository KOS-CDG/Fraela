// The film is cut to its music, "Lifetime" by Ben&Ben: 90 BPM at 30 fps, so a
// beat is 20 frames and a bar of four beats is 80. Every scene starts on a bar
// where the song changes: the intro builds for four bars, the band comes in at
// 10.7 s, the chorus starts at 48 s, and the film fades out on the bar after
// the chorus.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;
export const BEAT = 20;
export const BAR = BEAT * 4;
// The song's first downbeat is 0.41 s into the file, so the film starts 12
// frames in. Bars then land within a frame of the grid for the whole film.
export const MUSIC_START = 12;

export const SCENES = {
  opening: { from: 0, durationInFrames: 4 * BAR },
  bloom: { from: 4 * BAR, durationInFrames: 2 * BAR },
  stone: { from: 6 * BAR, durationInFrames: 2 * BAR },
  gold: { from: 8 * BAR, durationInFrames: 4 * BAR },
  white: { from: 12 * BAR, durationInFrames: 2 * BAR },
  mosaic: { from: 14 * BAR, durationInFrames: 4 * BAR },
  finale: { from: 18 * BAR, durationInFrames: 9 * BAR },
} as const;

// 2160 frames, 72 s: the chorus runs to 69 s and the music fades over the last bar.
export const FILM_FRAMES = SCENES.finale.from + SCENES.finale.durationInFrames;

// anime.js counts milliseconds; scenes are written in frames.
export const ms = (frames: number) => (frames / FPS) * 1000;
