import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import confetti from "../audio/confetti.mp3";
import ding from "../audio/ding.wav";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { Confetti } from "../lib/Confetti";
import { content, TONES } from "../lib/content";
import { SERIF } from "../lib/fonts";
import { RiseText } from "../lib/RiseText";

const tone = TONES.closing;
const CONFETTI_COLORS = [
  TONES.closing.accent,
  TONES.night.accent,
  TONES.gold.accent,
  TONES.white.accent,
  TONES.bloom.accent,
  TONES.stone.accent,
];

// The birthday wish, with confetti in every chapter's colour.
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const words = content.film.finaleNote.split(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: tone.bg, color: tone.ink }}>
      <Audio src={whoosh} volume={0.6} />
      <Audio src={confetti} from={12} volume={0.6} />
      <Audio src={ding} from={14} volume={0.5} />
      <Audio src={sparkle} from={100} volume={0.8} />

      <Interactive.H2
        name="Birthday wish"
        style={{
          position: "absolute",
          top: 300,
          left: 80,
          right: 80,
          margin: 0,
          textWrap: "balance",
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: 150,
          lineHeight: 0.92,
          letterSpacing: "-0.03em",
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "0px -40px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <RiseText
          text={content.film.finale}
          start={10}
          stagger={5}
          duration={26}
        />
      </Interactive.H2>

      <Interactive.P
        name="Note"
        style={{
          position: "absolute",
          top: 700,
          left: 80,
          right: 160,
          margin: 0,
          fontFamily: SERIF,
          fontSize: 54,
          lineHeight: 1.18,
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "0px -24px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              // Each word brightens in turn, like the closing message on the page.
              opacity: interpolate(frame, [44 + i * 3, 58 + i * 3], [0.14, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {word}
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </Interactive.P>

      <Interactive.Div
        name="Signoff"
        style={{
          position: "absolute",
          top: 1010,
          left: 80,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 84,
          lineHeight: 1,
          color: tone.accent,
          opacity: interpolate(frame, [100, 118], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [100, 122], ["0px 26px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {content.closing.signoff}
      </Interactive.Div>

      <Confetti
        count={90}
        colors={CONFETTI_COLORS}
        seed="birthday"
        start={12}
      />
    </AbsoluteFill>
  );
};
