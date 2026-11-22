import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import bgm from "./audio/bgm.mp3";
import { TONES } from "./lib/content";
import "./lib/fonts";
import { BloomScene, StoneScene, WhiteScene } from "./scenes/ChapterScene";
import { Finale } from "./scenes/Finale";
import { GoldReel } from "./scenes/GoldReel";
import { Opening } from "./scenes/Opening";
import { FILM_FRAMES, SCENE_FRAMES, TRANSITION } from "./timeline";

const crossfade = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION })}
  />
);

// The whole birthday film: opening, the four chapters, then the wish.
// Each scene brings its own sound effects; the music runs underneath.
export const Fraela2026: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: TONES.night.bg }}>
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Opening"
        durationInFrames={SCENE_FRAMES.opening}
      >
        <Opening />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence
        name="In bloom"
        durationInFrames={SCENE_FRAMES.bloom}
      >
        <BloomScene />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence
        name="Sage and stone"
        durationInFrames={SCENE_FRAMES.stone}
      >
        <StoneScene />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence
        name="Golden night"
        durationInFrames={SCENE_FRAMES.gold}
      >
        <GoldReel />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence
        name="In white"
        durationInFrames={SCENE_FRAMES.white}
      >
        <WhiteScene />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence
        name="Finale"
        durationInFrames={SCENE_FRAMES.finale}
      >
        <Finale />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <Audio
      name="Music"
      src={bgm}
      volume={(f) =>
        interpolate(
          f,
          [0, 36, FILM_FRAMES - 75, FILM_FRAMES],
          [0, 0.8, 0.8, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )
      }
    />
  </AbsoluteFill>
);
