import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  type EasingFunction,
  Img,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { filmPhotos, getChapter, photoSrc, TONES } from "../lib/content";
import { SERIF } from "../lib/fonts";
import { RiseText } from "../lib/RiseText";
import { Sparkles } from "../lib/Sparkles";

const chapter = getChapter("gold");
const tone = TONES.gold;
const PHOTO_W = 560;
const PHOTO_H = 747;
const GAP = 56;
// Frames the reel takes to glide from one photo to the next.
const GLIDE = 50;
const STEP = PHOTO_W + GAP;

// The page's sideways reel: the photos glide past one at a time, pausing on each,
// while gold sparkles twinkle in the dark.
export const GoldReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const photos = filmPhotos(chapter);
  const dwell =
    (durationInFrames - (photos.length - 1) * GLIDE) / photos.length;
  const begins = photos.map((_, i) => i * (dwell + GLIDE));

  // Hold each photo near the centre (drifting slowly), then glide to the next.
  const input: number[] = [];
  const output: number[] = [];
  const easing: EasingFunction[] = [];
  photos.forEach((_, i) => {
    const centred = width / 2 - (i * STEP + PHOTO_W / 2);
    input.push(begins[i], begins[i] + dwell);
    output.push(centred + 30, centred - 30);
    easing.push(Easing.linear);
    if (i < photos.length - 1) {
      easing.push(Easing.bezier(0.65, 0, 0.35, 1));
    }
  });
  const trackX = interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: tone.bg, color: tone.ink }}>
      <Audio src={whoosh} volume={0.8} />
      <Audio src={sparkle} from={12} />
      <Audio src={sparkle} from={Math.round(begins[2] ?? 190)} volume={0.7} />
      {begins.slice(1).map((begin) => (
        <Audio
          key={begin}
          src={whoosh}
          from={Math.round(begin - GLIDE)}
          volume={0.35}
        />
      ))}

      <Interactive.Div
        name="Numeral"
        style={{
          position: "absolute",
          top: 120,
          right: 30,
          fontFamily: SERIF,
          fontSize: 900,
          lineHeight: 0.8,
          color: tone.accent,
          opacity: 0.14,
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 70px", "0px -50px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        {chapter.numeral}
      </Interactive.Div>

      <Sparkles count={34} color={tone.accent} seed="gold" />

      <Interactive.H2
        name="Title"
        style={{
          position: "absolute",
          top: 100,
          left: 80,
          right: 80,
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: 104,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "0px -40px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <RiseText text={chapter.title} start={8} stagger={4} duration={24} />
      </Interactive.H2>

      <Interactive.Div
        name="Reel"
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          width: photos.length * STEP - GAP,
          height: PHOTO_H + 44,
          translate: `${trackX}px 0px`,
          opacity: interpolate(frame, [0, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.page}
            style={{
              position: "absolute",
              left: i * STEP,
              top: i % 2 === 0 ? 0 : 44,
              width: PHOTO_W,
              height: PHOTO_H,
              overflow: "hidden",
              boxShadow: "0 32px 64px rgb(0 0 0 / 0.5)",
            }}
          >
            <Img
              src={photoSrc(photo.page)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                scale: 1.12,
                // The picture inside each frame slides a little slower than the
                // frame itself, the same parallax as the page's reel.
                translate: `${((trackX + i * STEP + PHOTO_W / 2 - width / 2) / width) * -5}% 0%`,
              }}
            />
          </div>
        ))}
      </Interactive.Div>

      {photos.map((photo, i) => {
        const last = i === photos.length - 1;
        const fadeIn = Math.max(10, begins[i] - 8);
        const fadeOut = begins[i] + dwell + 6;
        return (
          <Interactive.P
            key={photo.page}
            name={`Caption ${photo.page}`}
            style={{
              position: "absolute",
              top: 1150,
              left: 80,
              right: 80,
              margin: 0,
              textAlign: "center",
              textWrap: "balance",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 44,
              lineHeight: 1.15,
              opacity: interpolate(
                frame,
                last
                  ? [fadeIn, fadeIn + 14]
                  : [fadeIn, fadeIn + 14, fadeOut, fadeOut + 10],
                last ? [0, 1] : [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            {photo.caption}
          </Interactive.P>
        );
      })}
    </AbsoluteFill>
  );
};
