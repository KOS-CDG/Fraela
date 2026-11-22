export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;

// "Last Night on Earth" by Green Day runs at exactly 60 BPM in 4/4,
// so a beat is 30 frames and a bar 120. Scenes start on bar lines and most
// moves land on beats or half beats (15 frames).
export const BEAT = 30;
export const BAR = BEAT * 4;
export const HALF = BEAT / 2;

// The film opens with one beat of sound effects only. The song's first
// piano chord (its first downbeat, 0.136 s into the file) lands on this frame.
export const COLD_OPEN = BEAT;
export const SONG_FIRST_BEAT = 0.136;

// The music is an edit of the song. Bars 0 to 17 play as recorded: the piano
// intro, the first verse and the first chorus up to "...in the fire". On the
// next bar line the song jumps 34 bars ahead to the same spot in the last
// chorus, whose closing question leads into the piano outro.
export const JUMP_FROM_BAR = 18;
export const JUMP_TO_BAR = 52;
export const EDIT = COLD_OPEN + JUMP_FROM_BAR * BAR;

// The film frame on which a bar of the song starts, either side of the edit.
export const songBar = (bar: number) =>
  bar < JUMP_FROM_BAR
    ? COLD_OPEN + bar * BAR
    : EDIT + (bar - JUMP_TO_BAR) * BAR;

// The last piano chord rings for about two bars after the outro's last bar.
const TAIL = 2 * BEAT;

export const SCENES = {
  // Song intro (piano): a phone wakes at 11:59 and a postcard arrives at midnight.
  midnight: { from: 0, durationInFrames: songBar(2) },
  postcard: { from: songBar(2), durationInFrames: 2 * BAR },
  // Verse: "I text a postcard...", "...did it go through?", "Sending all my love..."
  sent: { from: songBar(4), durationInFrames: 3 * BAR },
  // Night falls, "...the moonlight of my life", "every night", "Giving all my love..."
  moonlight: { from: songBar(7), durationInFrames: 4 * BAR },
  // The build into the chorus, then "My beating heart belongs to you".
  heartbeat: { from: songBar(11), durationInFrames: 3 * BAR },
  // "I walked for miles 'til I found you".
  miles: { from: songBar(14), durationInFrames: 2 * BAR },
  // "I'm here to honor you".
  honor: { from: songBar(16), durationInFrames: BAR },
  // "If I lose everything in the fire".
  fire: { from: songBar(17), durationInFrames: BAR },
  // After the edit: "Did I ever make it through?"
  madeIt: { from: songBar(52), durationInFrames: BAR },
  // Piano outro: fireworks, the birthday wish and back to the phone.
  finale: { from: songBar(53), durationInFrames: 4 * BAR + TAIL },
} as const;

export const FILM_FRAMES =
  SCENES.finale.from + SCENES.finale.durationInFrames;

// anime.js times are in milliseconds.
export const ms = (frames: number) => (frames / FPS) * 1000;
