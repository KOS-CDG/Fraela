import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import heartbeat from "../audio/heartbeat.wav";
import impact from "../audio/impact.mp3";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { makeHeart } from "@remotion/shapes";
import { one, useAnimeTimeline } from "../lib/anime";
import { addBurst, Burst } from "../lib/Burst";
import { photo } from "../lib/photos";
import { Sparkles } from "../lib/Sparkles";
import { BAR, BEAT, ms } from "../timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames: three bars.
const SLAM = BAR; // the music ducks under an impact here (see Fraela2026.tsx)
const WORD = 162; // a big beat on the word about her heart
const SHRINK = 3 * BAR - 26;

// The heart window, centred a little above the middle of the frame.
const HEART = makeHeart({ height: 760, aspectRatio: 1.1 });
const CENTER = { x: 540, y: 600 };
const LEFT = CENTER.x - HEART.width / 2;
const TOP = CENTER.y - HEART.height / 2;
const PHOTOS = [396, 459, 439, 444, 140, 37, 192, 729];
const POSITIONS: Record<number, string> = {
  396: "center 30%",
  459: "center 28%",
  439: "center 30%",
  444: "center 35%",
  140: "center 30%",
  37: "center 25%",
  192: "center 25%",
  729: "center 40%",
};

// An electrocardiogram: flat, with a heartbeat every SPACING pixels.
const SPEED = 1080 / BAR;
const SPACING = BEAT * SPEED;
const ecg = (x: number) => {
  const k = ((x % SPACING) + SPACING) % SPACING;
  const d = k < SPACING / 2 ? k : k - SPACING;
  const g = (centre: number, width: number) =>
    Math.exp(-(((d - centre) / width) ** 2));
  return (
    -10 * g(-62, 14) +
    18 * g(-12, 4) -
    150 * g(0, 5) +
    44 * g(11, 5) -
    22 * g(70, 20)
  );
};
// The head reaches a beat on every beat of the song; OFFSET places those
// beats on the screen, evenly between the edges.
const OFFSET = SPACING / 2;

// How much a heart swells `t` frames after a beat: lub, then dub.
const lubDub = (t: number, strength: number) =>
  t < 0
    ? 0
    : strength *
      (0.09 * Math.exp(-(((t - 2) / 3) ** 2)) +
        0.05 * Math.exp(-(((t - 10) / 3) ** 2)));

// Bars 11 to 13, the pre-chorus: a heartbeat. A heart monitor traces across a
// red room while an empty heart thumps louder and louder; on the next bar it
// slams full of her photo, beats with a new one every beat, swells on the
// word, and shrinks into a map pin.
export const Heartbeat: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      one(el, ".window"),
      { scale: [2.6, 1], opacity: [0, 1], duration: 420, ease: "outExpo" },
      ms(SLAM),
    );
    addBurst(tl, el, "word", ms(WORD));
    addBurst(tl, el, "slam", ms(SLAM));
    tl.add(
      one(el, ".shrink"),
      { scale: [1, 0.16], y: [0, 420], duration: ms(24), ease: "inBack(1.4)" },
      ms(SHRINK),
    );
  });

  const beatIndex = Math.floor(frame / BEAT);
  const sinceBeat = frame - beatIndex * BEAT;
  // The empty heart gets louder through the first bar.
  const strength = frame < SLAM ? 0.5 + (beatIndex / 3) * 0.5 : 1;
  const sinceWord = frame - WORD;
  const swell =
    1 +
    lubDub(sinceBeat, strength) +
    (sinceWord >= 0 ? 0.16 * Math.exp(-sinceWord / 6) : 0);
  const shot = Math.min(
    PHOTOS.length - 1,
    Math.max(0, Math.floor((frame - SLAM) / BEAT)),
  );
  const shotFlash =
    frame >= SLAM ? interpolate(sinceBeat, [0, 6], [0.6, 0], clamp) : 0;
  const ghost =
    frame < SLAM ? 0.08 + beatIndex * 0.05 + lubDub(sinceBeat, 1) * 2 : 0;
  const glow = 0.35 + lubDub(sinceBeat, strength) * 6;
  const head = OFFSET + frame * SPEED;
  const ecgY =
    frame < SLAM
      ? 1130
      : interpolate(frame, [SLAM, SLAM + 20], [1130, 1220], clamp);
  const ecgScale = frame < SLAM ? 1 : 0.55;
  const toMap = interpolate(frame, [SHRINK + 6, 3 * BAR], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

  // The trace: the last 760 pixels behind the head, broken where it wraps.
  const segments: string[] = [];
  let current = "";
  let lastX = Infinity;
  for (let v = head - 760; v <= head; v += 3) {
    const x = ((v % 1080) + 1080) % 1080;
    const y = ecgY + ecg(v - OFFSET) * ecgScale;
    if (x < lastX) {
      if (current) {
        segments.push(current);
      }
      current = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      current += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    lastX = x;
  }
  segments.push(current);
  const headX = ((head % 1080) + 1080) % 1080;
  const headY = ecgY + ecg(head - OFFSET) * ecgScale;

  // Rings that ripple out of the heart on beats 2 and 4, and on the word.
  const rings = [...[1, 3, 5, 7, 9, 11].map((b) => b * BEAT), WORD].filter(
    (at) => frame >= at && frame < at + 24 && frame < SHRINK,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#12020A", overflow: "hidden" }}>
      {Array.from({ length: 12 }, (_, b) =>
        b === 4 ? null : (
          <Audio
            key={b}
            src={heartbeat}
            from={b * BEAT}
            volume={b < 4 ? 0.26 + b * 0.06 : 0.36}
          />
        ),
      )}
      <Audio src={impact} from={SLAM} volume={0.7} />
      <Audio src={sparkle} from={WORD} volume={0.3} />
      <Audio src={whoosh} from={SHRINK - 4} volume={0.45} />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 60% at 50% 45%, #6E0F2E 0%, #3A0618 50%, #12020A 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 35% at 50% ${(CENTER.y / 1350) * 100}%, rgb(255 90 130 / ${glow}), transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#EFE2C8", opacity: toMap }} />

      {/* The heart monitor. */}
      <svg
        width={1080}
        height={1350}
        style={{ position: "absolute", inset: 0, opacity: 1 - toMap }}
      >
        <defs>
          <filter id="ecg-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#FF8FB0"
            strokeWidth={frame < SLAM ? 5 : 3.5}
            strokeLinejoin="round"
            opacity={0.9}
            filter="url(#ecg-glow)"
          />
        ))}
        <circle
          cx={headX}
          cy={headY}
          r={9}
          fill="#FFE3EC"
          filter="url(#ecg-glow)"
        />
      </svg>

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        <div
          className="shrink"
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              scale: swell,
              transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
            }}
          >
            {rings.map((at) => {
              const t = frame - at;
              const big = at === WORD;
              return (
                <svg
                  key={at}
                  width={HEART.width}
                  height={HEART.height}
                  viewBox={`0 0 ${HEART.width} ${HEART.height}`}
                  style={{
                    position: "absolute",
                    left: LEFT,
                    top: TOP,
                    overflow: "visible",
                    scale: 1 + t * (big ? 0.03 : 0.018),
                    opacity: (1 - t / 24) * (big ? 0.9 : 0.5),
                  }}
                >
                  <path
                    d={HEART.path}
                    fill="none"
                    stroke="#FFB3C8"
                    strokeWidth={big ? 10 : 6}
                  />
                </svg>
              );
            })}

            {/* The empty heart of the first bar, with her face faintly in it. */}
            <div
              style={{
                position: "absolute",
                left: LEFT,
                top: TOP,
                width: HEART.width,
                height: HEART.height,
                clipPath: `path('${HEART.path}')`,
                opacity: frame < SLAM + 6 ? 1 : 0,
              }}
            >
              <Img
                src={photo(PHOTOS[0])}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: POSITIONS[PHOTOS[0]],
                  opacity: ghost,
                  filter: "grayscale(1) contrast(1.2)",
                }}
              />
            </div>
            <svg
              width={HEART.width}
              height={HEART.height}
              viewBox={`0 0 ${HEART.width} ${HEART.height}`}
              style={{
                position: "absolute",
                left: LEFT,
                top: TOP,
                overflow: "visible",
              }}
            >
              <path
                d={HEART.path}
                fill="none"
                stroke="#FFD1DE"
                strokeWidth={8}
                style={{
                  filter: "drop-shadow(0 0 18px rgb(255 120 160 / 0.9))",
                }}
              />
            </svg>

            {/* From the second bar: the heart full of photos. */}
            <div
              className="window"
              style={{
                position: "absolute",
                left: LEFT,
                top: TOP,
                width: HEART.width,
                height: HEART.height,
                opacity: 0,
                transform: "scale(2.6)",
                filter: "drop-shadow(0 30px 60px rgb(0 0 0 / 0.55))",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: `path('${HEART.path}')`,
                }}
              >
                <Img
                  src={photo(PHOTOS[shot])}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: POSITIONS[PHOTOS[shot]],
                    scale: interpolate(sinceBeat, [0, BEAT], [1.1, 1.02]),
                  }}
                />
                <AbsoluteFill
                  style={{
                    background:
                      "radial-gradient(70% 60% at 50% 40%, transparent 55%, rgb(110 15 46 / 0.55) 100%)",
                  }}
                />
                <AbsoluteFill
                  style={{ backgroundColor: "#FFF0F4", opacity: shotFlash }}
                />
              </div>
              <svg
                width={HEART.width}
                height={HEART.height}
                viewBox={`0 0 ${HEART.width} ${HEART.height}`}
                style={{ position: "absolute", inset: 0, overflow: "visible" }}
              >
                <path
                  d={HEART.path}
                  fill="none"
                  stroke="#FFE3EC"
                  strokeWidth={10}
                />
              </svg>
            </div>
          </div>
          <Burst
            id="slam"
            x={CENTER.x}
            y={CENTER.y}
            count={26}
            colors={["#FF8FB0", "#FFE3EC", "#E2BF7A"]}
            spread={620}
          />
          <Burst
            id="word"
            x={CENTER.x}
            y={CENTER.y - 120}
            count={30}
            colors={["#FFB3C8", "#FFFFFF", "#F28DB2"]}
            spread={700}
          />
        </div>
      </div>
      {frame >= WORD && frame < SHRINK ? (
        <Sparkles count={16} color="#FFE3EC" seed="heart-word" start={WORD} />
      ) : null}
    </AbsoluteFill>
  );
};
