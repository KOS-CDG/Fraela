import { Audio } from "@remotion/media";
import { stagger, svg } from "animejs";
import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import paper from "../audio/paper.wav";
import pop from "../audio/pop.mp3";
import sparkle from "../audio/sparkle.mp3";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { getChapter, photoSrc, TONES } from "../lib/content";
import { SERIF } from "../lib/fonts";
import { Split } from "../lib/Split";
import { BEAT, ms } from "../timeline";

const chapter = getChapter("white");
const tone = TONES.white;
const CARD_W = 400;
const CARD_H = 490;
// Where each print lands on the table, and where it is thrown from.
const PRINTS = [
  { left: 70, top: 120, rotate: -8, fromX: -900, fromY: -200 },
  { left: 600, top: 100, rotate: 7, fromX: 900, fromY: -260 },
  { left: 330, top: 290, rotate: -3, fromX: -200, fromY: 1200 },
  { left: 60, top: 560, rotate: 6, fromX: -900, fromY: 300 },
  { left: 620, top: 540, rotate: -6, fromX: 900, fromY: 360 },
  { left: 340, top: 600, rotate: 4, fromX: 160, fromY: 1300 },
];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// "In white": prints are tossed onto a table one per beat. Sideways and upward
// motion use different easings, so each print flies in on a curve. The title
// gets a hand-drawn underline and a heart.
export const White: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    all(el, ".print").forEach((print, i) => {
      const spot = PRINTS[i];
      tl.add(
        print,
        {
          opacity: { from: 0, to: 1, duration: 40 },
          x: { from: spot.fromX, to: 0, ease: "outQuart" },
          y: { from: spot.fromY, to: 0, ease: "outBack(1.1)" },
          rotate: { from: spot.rotate * 5, to: spot.rotate, ease: "outQuart" },
          scale: { from: 1.3, to: 1, ease: "outQuad" },
          duration: 520,
        },
        ms(i * BEAT),
      );
    });
    // The whole table hops on the beat, then everything drops out of frame.
    tl.add(
      all(el, ".print"),
      {
        y: [
          { to: -18, duration: 110, ease: "outQuad" },
          { to: 0, duration: 260, ease: "outBounce" },
        ],
      },
      stagger(22, { start: ms(6 * BEAT) }),
    );
    tl.add(
      [...all(el, ".print"), one(el, ".title"), one(el, ".doodles")],
      { y: "+=1500", rotate: "+=14", duration: 380, ease: "inExpo" },
      stagger(20, { start: ms(7 * BEAT) + 20 }),
    );
    tl.add(
      all(el, ".title-char"),
      {
        opacity: [0, 1],
        y: [90, 0],
        rotate: [12, 0],
        duration: 600,
        ease: "outBack(2)",
      },
      stagger(32, { start: ms(8) }),
    );
    tl.add(
      svg.createDrawable(all(el, ".scribble")),
      { draw: ["0 0", "0 1"], duration: 700, ease: "inOutSine" },
      stagger(260, { start: ms(3 * BEAT) }),
    );
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      {PRINTS.map((_, i) => (
        <React.Fragment key={i}>
          <Audio src={paper} from={i * BEAT} volume={0.65} />
          <Audio src={pop} from={i * BEAT + 9} volume={0.3} />
        </React.Fragment>
      ))}
      <Audio src={sparkle} from={3 * BEAT} volume={0.45} />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        {chapter.photos.map((photo, i) => (
          <div
            key={photo.page}
            className="print"
            style={{
              position: "absolute",
              left: PRINTS[i].left,
              top: PRINTS[i].top,
              width: CARD_W,
              height: CARD_H,
              padding: "20px 20px 72px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 22px 44px rgb(91 35 112 / 0.25)",
              opacity: 0,
            }}
          >
            <Img
              src={photoSrc(photo.page)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 35%",
                display: "block",
              }}
            />
          </div>
        ))}

        <div
          className="title"
          style={{
            position: "absolute",
            left: 80,
            top: 1080,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 180,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          <Split text={chapter.title} className="title-char" />
        </div>

        <svg
          className="doodles"
          width={1080}
          height={1350}
          viewBox="0 0 1080 1350"
          style={{ position: "absolute", left: 0, top: 0 }}
          fill="none"
          stroke={tone.accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            className="scribble"
            d="M86 1262 C 180 1240, 260 1282, 360 1258 S 520 1236, 610 1262"
          />
          <path
            className="scribble"
            d="M820 1180 C 760 1120, 700 1170, 760 1230 L 820 1280 L 880 1230 C 940 1170, 880 1120, 820 1180 Z"
          />
        </svg>
      </div>

      <AbsoluteFill
        style={{
          backgroundColor: "#FFFFFF",
          opacity: interpolate(frame, [0, 10], [1, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
