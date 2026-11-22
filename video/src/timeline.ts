// The film is cut to its music: 120 BPM at 30 fps, so a beat is 15 frames and a
// bar of four beats is 60. Every scene starts on a bar, where the track changes:
// the intro stabs stop at 7.7 s, the band drops in at 8 s, the groove breaks at
// 23 s, the chorus starts at 24 s and the last hit lands at 40 s.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;
export const BEAT = 15;
export const BAR = BEAT * 4;

export const SCENES = {
  opening: { from: 0, durationInFrames: 4 * BAR },
  bloom: { from: 4 * BAR, durationInFrames: 2 * BAR },
  stone: { from: 6 * BAR, durationInFrames: 2 * BAR },
  gold: { from: 8 * BAR, durationInFrames: 4 * BAR },
  white: { from: 12 * BAR, durationInFrames: 2 * BAR },
  mosaic: { from: 14 * BAR, durationInFrames: 3 * BAR },
  finale: { from: 17 * BAR, durationInFrames: 5 * BAR },
} as const;

// 1320 frames, 44 s: the music's last chord rings out to the end.
export const FILM_FRAMES = SCENES.finale.from + SCENES.finale.durationInFrames;

// anime.js counts milliseconds; scenes are written in frames.
export const ms = (frames: number) => (frames / FPS) * 1000;
