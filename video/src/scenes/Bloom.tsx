import { Audio } from "@remotion/media";
import { stagger } from "animejs";
import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import impact from "../audio/impact.mp3";
import pop from "../audio/pop.mp3";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { getChapter, photoSrc, TONES } from "../lib/content";
import { SERIF } from "../lib/fonts";
import { Split } from "../lib/Split";
import { Sunburst } from "../lib/Sunburst";
import { BEAT, ms } from "../timeline";

const chapter = getChapter("bloom");
const tone = TONES.bloom;
const STICKER_W = 500;
const STICKER_H = 667;
// Where each photo lands, as a pile of stickers.
const SPOTS = [
  { left: 80, top: 130, rotate: -7 },
  { left: 500, top: 190, rotate: 6 },
  { left: 130, top: 330, rotate: 4 },
  { left: 450, top: 300, rotate: -5 },
];
const FLOWERS = [
  { x: 960, y: 120, size: 150, color: tone.accent },
  { x: 70, y: 1010, size: 120, color: "#F0A1B7" },
  { x: 1000, y: 900, size: 110, color: "#FBEFF6" },
  { x: 40, y: 90, size: 96, color: "#F0A1B7" },
  { x: 900, y: 1240, size: 140, color: tone.accent },
  { x: 560, y: 70, size: 70, color: "#FBEFF6" },
];
const PETALS = Array.from({ length: 8 }, (_, i) => i * 45);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Flower: React.FC<{ readonly color: string; readonly spin: number }> = ({
  color,
  spin,
}) => (
  <svg viewBox="-50 -50 100 100" style={{ rotate: `${spin}deg` }}>
    {PETALS.map((angle) => (
      <ellipse
        key={angle}
        cx={0}
        cy={-26}
        rx={13}
        ry={24}
        fill={color}
        transform={`rotate(${angle})`}
      />
    ))}
    <circle r={15} fill={TONES.bloom.bg} />
    <circle r={9} fill={color} />
  </svg>
);

// "In bloom", the first bars after the drop: the sun bursts open, flowers pop
// up around the edges and the photos land one after another like stickers.
export const Bloom: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      one(el, ".sun"),
      { scale: [0, 1], duration: 700, ease: "outBack(1.3)" },
      0,
    );
    all(el, ".sticker").forEach((sticker, i) => {
      const spot = SPOTS[i];
      tl.add(
        sticker,
        {
          opacity: { from: 0, to: 1, duration: 60 },
          scale: [1.75, 1],
          rotate: [spot.rotate + (i % 2 ? 22 : -22), spot.rotate],
          duration: 700,
          ease: "outElastic(1, .65)",
        },
        ms(i * 2 * BEAT),
      );
    });
    tl.add(
      all(el, ".flower"),
      {
        scale: [0, 1],
        rotate: [-120, 0],
        duration: 800,
        ease: "outElastic(1, .5)",
      },
      stagger(ms(BEAT) / 2, { start: ms(4) }),
    );
    // The flowers bob on every beat.
    for (let beat = 2; beat < 7; beat++) {
      tl.add(
        all(el, ".flower"),
        {
          scale: [
            { to: 1.18, duration: 70, ease: "outQuad" },
            { to: 1, duration: 260, ease: "outQuad" },
          ],
        },
        stagger(30, { start: ms(beat * BEAT) }),
      );
    }
    tl.add(
      all(el, ".title-char"),
      { opacity: [0, 1], y: [-300, 0], duration: 900, ease: "outBounce" },
      stagger(40, { start: ms(6) }),
    );
    // Out on the last beat: everything spins down to nothing before the cut.
    tl.add(
      [...all(el, ".sticker"), ...all(el, ".flower"), one(el, ".title")],
      { scale: 0, rotate: "+=25", duration: 280, ease: "inBack(2)" },
      stagger(18, { start: ms(7 * BEAT) + 140 }),
    );
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      <Audio src={impact} volume={0.65} />
      <Audio src={whoosh} volume={0.4} />
      <Audio src={sparkle} from={8} volume={0.5} />
      <Audio src={pop} from={2 * BEAT} volume={0.6} />
      <Audio src={pop} from={4 * BEAT} volume={0.6} />
      <Audio src={pop} from={6 * BEAT} volume={0.65} />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        <div
          className="sun"
          style={{ position: "absolute", left: 540, top: 600 }}
        >
          <div style={{ rotate: `${frame * 0.6}deg` }}>
            <Sunburst
              color={tone.accent}
              size={2600}
              rays={22}
              style={{ opacity: 0.2 }}
            />
          </div>
        </div>

        {FLOWERS.map((flower, i) => (
          <div
            key={i}
            className="flower"
            style={{
              position: "absolute",
              left: flower.x - flower.size / 2,
              top: flower.y - flower.size / 2,
              width: flower.size,
              height: flower.size,
              transform: "scale(0)",
            }}
          >
            <Flower color={flower.color} spin={frame * (i % 2 ? -1.4 : 1.1)} />
          </div>
        ))}

        {chapter.photos.map((photo, i) => (
          <div
            key={photo.page}
            className="sticker"
            style={{
              position: "absolute",
              left: SPOTS[i].left,
              top: SPOTS[i].top,
              width: STICKER_W,
              height: STICKER_H,
              padding: 16,
              backgroundColor: "#FFFDF8",
              boxShadow: "0 30px 60px rgb(40 8 52 / 0.45)",
              opacity: 0,
            }}
          >
            <Img
              src={photoSrc(photo.page)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 30%",
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
            top: 1040,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 200,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          <Split text={chapter.title} className="title-char" />
        </div>
      </div>

      <AbsoluteFill
        style={{
          backgroundColor: "#FFFFFF",
          opacity: interpolate(frame, [0, 9], [0.85, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
