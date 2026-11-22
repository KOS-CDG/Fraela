import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence } from "remotion";
import bgm from "./audio/bgm.mp3";
import { TONES } from "./lib/content";
import "./lib/fonts";
import { Bloom } from "./scenes/Bloom";
import { Finale } from "./scenes/Finale";
import { Gold } from "./scenes/Gold";
import { Mosaic } from "./scenes/Mosaic";
import { Opening } from "./scenes/Opening";
import { Stone } from "./scenes/Stone";
import { White } from "./scenes/White";
import { BAR, FILM_FRAMES, SCENES } from "./timeline";

export const MUSIC_VOLUME = 0.75;
// The drop and the last hit stack an impact on the loudest moments of the
// music, so the music ducks under them for a moment instead of clipping.
const HITS = [SCENES.bloom.from, SCENES.finale.from + 3 * BAR];

const musicVolume = (f: number) => {
  const duck = HITS.reduce(
    (level, hit) =>
      f >= hit - 1
        ? Math.min(level, 1 - 0.4 * Math.exp(-(f - hit + 1) / 9))
        : level,
    1,
  );
  const fadeOut = interpolate(f, [FILM_FRAMES - 24, FILM_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return MUSIC_VOLUME * duck * fadeOut;
};

// The whole birthday film. Scenes are hard cuts on the bar lines of the music
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

    <Audio name="Music" src={bgm} volume={musicVolume} />
  </AbsoluteFill>
);
