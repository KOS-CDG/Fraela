import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import lifetime from "./audio/lifetime.mp3";
import { TONES } from "./lib/content";
import "./lib/fonts";
import { Bloom } from "./scenes/Bloom";
import { Finale } from "./scenes/Finale";
import { Gold } from "./scenes/Gold";
import { Mosaic } from "./scenes/Mosaic";
import { Opening } from "./scenes/Opening";
import { Stone } from "./scenes/Stone";
import { White } from "./scenes/White";
import { BAR, FILM_FRAMES, MUSIC_START, SCENES } from "./timeline";

// The song is mastered loud, so it plays well below full volume to leave room
// for the sound effects.
export const MUSIC_VOLUME = 0.42;
// The band's entry and the cannons stack an impact on loud moments of the
// song, so the music ducks under them for a moment instead of clipping.
const HITS = [SCENES.bloom.from, SCENES.finale.from + 4 * BAR];
const FADE_FROM = FILM_FRAMES - BAR;

const musicVolume = (f: number) => {
  const duck = HITS.reduce(
    (level, hit) =>
      f >= hit - 1
        ? Math.min(level, 1 - 0.3 * Math.exp(-(f - hit + 1) / 9))
        : level,
    1,
  );
  // Over the last bar the music fades evenly in decibels, down to -36 dB.
  const fade = f < FADE_FROM ? 1 : 10 ** ((-36 * (f - FADE_FROM)) / BAR / 20);
  return MUSIC_VOLUME * duck * fade;
};

// The whole birthday film. Scenes are hard cuts on the bar lines of the song
// (see timeline.ts); each scene brings its own sound effects.
export const Fraela2026: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: TONES.night.bg }}>
    <Sequence name="2026 was a full blast" {...SCENES.opening}>
      <Opening />
    </Sequence>
    <Sequence name="In bloom" {...SCENES.bloom}>
      <Bloom />
    </Sequence>
    <Sequence name="Sage and stone" {...SCENES.stone}>
      <Stone />
    </Sequence>
    <Sequence name="Golden night" {...SCENES.gold}>
      <Gold />
    </Sequence>
    <Sequence name="In white" {...SCENES.white}>
      <White />
    </Sequence>
    <Sequence name="Every photo" {...SCENES.mosaic}>
      <Mosaic />
    </Sequence>
    <Sequence name="The wish" {...SCENES.finale}>
      <Finale />
    </Sequence>

    <Audio
      name="Lifetime, Ben&Ben"
      src={lifetime}
      trimBefore={MUSIC_START}
      volume={musicVolume}
    />
  </AbsoluteFill>
);
