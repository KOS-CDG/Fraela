import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import shutter from "../audio/shutter.wav";
import whoosh from "../audio/whoosh.mp3";
import {
  type ChapterId,
  filmPhotos,
  getChapter,
  photoSrc,
  TONES,
} from "../lib/content";
import { SERIF } from "../lib/fonts";
import { RiseText } from "../lib/RiseText";

// Frames a new photo takes to wipe up over the previous one.
const WIPE = 16;

const PhotoLayer: React.FC<{
  readonly page: number;
  readonly index: number;
}> = ({ page, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sway = index % 2 === 0 ? 16 : -16;

  return (
    <AbsoluteFill
      style={{
        // Each new photo is revealed from the bottom edge up, like the page scrolling.
        clipPath:
          index === 0
            ? undefined
            : `inset(${interpolate(frame, [0, WIPE], [100, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.65, 0, 0.35, 1),
              })}% 0 0 0)`,
      }}
    >
      <Img
        src={photoSrc(page)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, durationInFrames], [1.06, 1.16], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          translate:
            index === 0
              ? interpolate(
                  frame,
                  [0, durationInFrames],
                  ["0px 0px", `${sway}px -20px`],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                )
              : interpolate(
                  frame,
                  [0, WIPE, durationInFrames],
                  ["0px 120px", "0px 0px", `${sway}px -20px`],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: [Easing.bezier(0.65, 0, 0.35, 1), Easing.linear],
                  },
                ),
        }}
      />
    </AbsoluteFill>
  );
};

// One chapter of the page: its colours, its title, and the photos marked
// "film": true, each with its caption. Layers drift at different speeds.
export const ChapterScene: React.FC<{ readonly chapterId: ChapterId }> = ({
  chapterId,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const chapter = getChapter(chapterId);
  const tone = TONES[chapterId];
  const photos = filmPhotos(chapter);
  const slot = Math.floor(durationInFrames / photos.length);
  const light = chapterId === "white";

  return (
    <AbsoluteFill style={{ backgroundColor: tone.bg, color: tone.ink }}>
      <Audio src={whoosh} volume={0.8} />
      {photos.slice(1).map((photo, i) => (
        <Audio
          key={photo.page}
          src={shutter}
          from={(i + 1) * slot}
          volume={0.4}
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
          opacity: light ? 0.2 : 0.16,
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
            ["0px 0px", "0px -56px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <RiseText text={chapter.title} start={8} stagger={4} duration={24} />
      </Interactive.H2>

      <Interactive.Div
        name="Photo frame"
        style={{
          position: "absolute",
          left: 208,
          top: 236,
          width: 664,
          height: 885,
          overflow: "hidden",
          boxShadow: light
            ? "0 32px 64px rgb(60 16 72 / 0.26)"
            : "0 32px 64px rgb(10 2 14 / 0.45)",
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 26, durationInFrames],
            ["0px 70px", "0px 18px", "0px -18px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            },
          ),
        }}
      >
        {photos.map((photo, i) => (
          <Sequence
            key={photo.page}
            name={`Photo ${photo.page}`}
            from={i * slot}
            durationInFrames={
              i === photos.length - 1
                ? durationInFrames - i * slot
                : slot + WIPE
            }
            layout="absolute-fill"
          >
            <PhotoLayer page={photo.page} index={i} />
          </Sequence>
        ))}
      </Interactive.Div>

      {photos.map((photo, i) => {
        const start = i * slot;
        const end = (i + 1) * slot;
        const last = i === photos.length - 1;
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
                  ? [start + 8, start + 22]
                  : [start + 8, start + 22, end - 4, end + 6],
                last ? [0, 1] : [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              translate: interpolate(
                frame,
                [start + 8, start + 24],
                ["0px 20px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
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

export const BloomScene: React.FC = () => <ChapterScene chapterId="bloom" />;
export const StoneScene: React.FC = () => <ChapterScene chapterId="stone" />;
export const WhiteScene: React.FC = () => <ChapterScene chapterId="white" />;
