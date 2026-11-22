import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { content, photoSrc, TONES } from "../lib/content";
import { SANS, SERIF } from "../lib/fonts";
import { RiseText } from "../lib/RiseText";

const tone = TONES.night;
const [backPage, mainPage, frontPage] = content.hero;
const SHADOW = "0 32px 64px rgb(10 2 14 / 0.5)";

// The website's hero, set in motion: three layered photos drift upward at
// different speeds while her name rises over them.
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: tone.bg, color: tone.ink }}>
      <Audio src={whoosh} volume={0.55} />
      <Audio src={sparkle} from={30} />

      <Interactive.Div
        name="Back photo"
        style={{
          position: "absolute",
          left: 80,
          top: 300,
          width: 300,
          height: 400,
          overflow: "hidden",
          boxShadow: SHADOW,
          opacity: interpolate(frame, [0, 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 32, durationInFrames],
            ["0px 80px", "0px 0px", "0px -26px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            },
          ),
        }}
      >
        <Img
          src={photoSrc(backPage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: interpolate(frame, [0, durationInFrames], [1.14, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Main photo"
        style={{
          position: "absolute",
          left: 280,
          top: 270,
          width: 520,
          height: 693,
          overflow: "hidden",
          boxShadow: SHADOW,
          opacity: interpolate(frame, [5, 29], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [5, 37, durationInFrames],
            ["0px 110px", "0px 0px", "0px -52px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            },
          ),
        }}
      >
        <Img
          src={photoSrc(mainPage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: interpolate(frame, [0, durationInFrames], [1.12, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Front photo"
        style={{
          position: "absolute",
          left: 700,
          top: 730,
          width: 300,
          height: 400,
          overflow: "hidden",
          boxShadow: SHADOW,
          opacity: interpolate(frame, [10, 34], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [10, 42, durationInFrames],
            ["0px 150px", "0px 0px", "0px -96px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            },
          ),
        }}
      >
        <Img
          src={photoSrc(frontPage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: interpolate(frame, [0, durationInFrames], [1.16, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Happy birthday"
        style={{
          position: "absolute",
          top: 130,
          left: 80,
          right: 80,
          margin: 0,
          textAlign: "center",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 84,
          lineHeight: 1,
          color: tone.accent,
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "0px -18px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <RiseText text={content.film.opening} start={16} stagger={4} />
      </Interactive.Div>

      <Interactive.H1
        name="Name"
        style={{
          position: "absolute",
          top: 820,
          left: 0,
          right: 0,
          margin: 0,
          textAlign: "center",
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: 280,
          lineHeight: 0.8,
          letterSpacing: "-0.045em",
          textShadow: "0 0.04em 0.35em rgb(20 4 26 / 0.45)",
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "0px -34px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <RiseText
          text={content.title}
          start={28}
          by="letter"
          stagger={3}
          duration={26}
        />
      </Interactive.H1>

      <Interactive.Div
        name="Year"
        style={{
          position: "absolute",
          top: 1100,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 44,
          letterSpacing: "0.12em",
          opacity: interpolate(frame, [52, 72], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [52, 72, durationInFrames],
            ["0px 24px", "0px 0px", "0px -34px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            },
          ),
        }}
      >
        {content.year}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
