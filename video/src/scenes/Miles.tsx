import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import ding from "../audio/ding.wav";
import pop from "../audio/pop.mp3";
import sparkle from "../audio/sparkle.mp3";
import stepLeft from "../audio/step-left.wav";
import stepRight from "../audio/step-right.wav";
import whip from "../audio/whip.wav";
import whoosh from "../audio/whoosh.mp3";
import { one, useAnimeTimeline } from "../lib/anime";
import { addBurst, Burst } from "../lib/Burst";
import { content } from "../lib/content";
import { HAND, SERIF } from "../lib/fonts";
import { Heart } from "../lib/Hearts";
import { PhotoCard } from "../lib/PhotoCard";
import { makeTrack, smoothThrough, toPath } from "../lib/track";
import { BAR, HALF, ms } from "../timeline";

const film = content.film;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames: two bars.
const COUNTER = 48; // the counter drops in on the word about miles
const ARRIVE = 150;
const CURTAIN = 2 * BAR - 26;
const START_COUNT = 2026;

// The map, in map pixels; the camera follows the walker up it.
const MAP_H = 4000;
const STOPS = [
  { x: 540, y: 3600, page: 0 },
  { x: 300, y: 3180, page: 186 },
  { x: 790, y: 2760, page: 213 },
  { x: 290, y: 2340, page: 292 },
  { x: 790, y: 1920, page: 320 },
  { x: 300, y: 1500, page: 867 },
  { x: 780, y: 1080, page: 917 },
  { x: 540, y: 660, page: 820 },
];
const PATH = smoothThrough(STOPS, 36);
const TRACK = makeTrack(PATH.points);
const REACH = PATH.indices.map((index) => TRACK.progressAt(index));
const walk = (frame: number) =>
  interpolate(frame, [0, ARRIVE], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
const STEPS = Math.floor(ARRIVE / HALF) + 1;
// The frame on which the walker reaches each stop.
const reachedAt = REACH.map((progress) => {
  let f = 0;
  while (f < ARRIVE && walk(f) < progress) {
    f++;
  }
  return f;
});

const CONTOURS = Array.from({ length: 16 }, (_, i) => ({
  x: random(`contour-x-${i}`) * 1080,
  y: random(`contour-y-${i}`) * MAP_H,
  r: 90 + random(`contour-r-${i}`) * 160,
  rings: 2 + Math.floor(random(`contour-n-${i}`) * 3),
  tilt: random(`contour-t-${i}`) * 180,
}));

const Footprint: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly opacity: number;
}> = ({ x, y, angle, opacity }) => (
  <svg
    width={60}
    height={60}
    viewBox="-20 -20 40 40"
    style={{
      position: "absolute",
      left: x - 30,
      top: y - 30,
      rotate: `${angle + 90}deg`,
      opacity,
    }}
  >
    <ellipse cx={0} cy={-5} rx={7} ry={10} fill="#6B3A4A" />
    <ellipse cx={0} cy={11} rx={5.5} ry={6} fill="#6B3A4A" />
  </svg>
);

const Compass: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <svg
    width={150}
    height={150}
    viewBox="-75 -75 150 150"
    style={{ position: "absolute", left: 40, bottom: 44, opacity: 0.7 }}
  >
    <circle r={62} fill="none" stroke="#7A4A50" strokeWidth={2} />
    <circle
      r={52}
      fill="none"
      stroke="#7A4A50"
      strokeWidth={1}
      strokeDasharray="2 6"
    />
    <g transform={`rotate(${Math.sin(frame * 0.08) * 8})`}>
      <path
        d="M0 -56 L10 0 L0 56 L-10 0 Z"
        fill="#E7D3B4"
        stroke="#7A4A50"
        strokeWidth={2}
      />
      <path d="M0 -56 L10 0 L-10 0 Z" fill="#B23A5E" />
    </g>
    <text
      y={-64}
      textAnchor="middle"
      fontFamily={SERIF}
      fontSize={22}
      fill="#7A4A50"
    >
      N
    </text>
  </svg>
);

// Bars 14 and 15, the end of the pre-chorus: the miles. On an old map the
// walker's footsteps follow a dotted path past photos of the places of the
// year, a counter of steps runs down to nothing, and the path ends at her,
// arms open. Velvet curtains close for the next scene.
export const Miles: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      one(el, ".counter"),
      {
        opacity: [0, 1],
        y: [-160, 0],
        scale: [0.8, 1],
        duration: 520,
        ease: "outBack(1.7)",
      },
      ms(COUNTER),
    );
    tl.add(
      one(el, ".counter-number"),
      {
        scale: [
          { from: 1, to: 1.35, duration: 110, ease: "outQuad" },
          { to: 1, duration: 500, ease: "outElastic(1, .4)" },
        ],
      },
      ms(ARRIVE),
    );
    addBurst(tl, el, "arrive", ms(ARRIVE));
    tl.add(
      one(el, ".curtain-left"),
      { x: [-600, 0], duration: ms(26), ease: "inQuad" },
      ms(CURTAIN),
    );
    tl.add(
      one(el, ".curtain-right"),
      { x: [600, 0], duration: ms(26), ease: "inQuad" },
      ms(CURTAIN),
    );
  });

  const p = walk(frame);
  const head = TRACK.at(p);
  // The walker starts where the last scene's heart landed, low in the frame,
  // walks at mid-height, and the camera settles lower at the end so the
  // last photo sits under the counter.
  const settle = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const walkerY =
    frame < 60
      ? interpolate(frame, [0, 34], [1020, 720], settle)
      : interpolate(frame, [104, ARRIVE + 6], [720, 1010], settle);
  const cameraY = walkerY - head.y;
  const zoom = interpolate(frame, [ARRIVE, 2 * BAR], [1, 1.12], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const count = Math.round(
    interpolate(frame, [COUNTER, ARRIVE], [START_COUNT, 0], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }),
  );
  const stepsTaken = Math.min(STEPS, Math.floor(frame / HALF) + 1);
  const landing = interpolate(frame, [0, 5, 12], [1, 0.84, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#EFE2C8", overflow: "hidden" }}>
      {Array.from({ length: STEPS }, (_, k) => (
        <Audio
          key={k}
          src={k % 2 ? stepRight : stepLeft}
          from={k * HALF}
          volume={0.55}
        />
      ))}
      {reachedAt.slice(1, -1).map((at, i) => (
        <Audio key={i} src={pop} from={at} volume={0.18} />
      ))}
      <Audio src={whip} from={COUNTER} volume={0.4} />
      <Audio src={ding} from={ARRIVE} volume={0.45} />
      <Audio src={sparkle} from={ARRIVE} volume={0.3} />
      <Audio src={whoosh} from={CURTAIN - 4} volume={0.5} />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            scale: zoom,
            transformOrigin: `540px 720px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1080,
              height: MAP_H,
              translate: `0px ${cameraY}px`,
              background:
                "radial-gradient(60% 30% at 30% 20%, rgb(255 248 230 / 0.6), transparent), radial-gradient(70% 25% at 70% 70%, rgb(214 190 150 / 0.35), transparent), #EFE2C8",
            }}
          >
            {/* Grid lines and contour rings, like an old survey map. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgb(122 74 80 / 0.08) 0 2px, transparent 2px 180px), repeating-linear-gradient(90deg, rgb(122 74 80 / 0.08) 0 2px, transparent 2px 180px)",
              }}
            />
            <svg
              width={1080}
              height={MAP_H}
              style={{ position: "absolute", inset: 0 }}
            >
              {CONTOURS.map((c, i) => (
                <g
                  key={i}
                  transform={`translate(${c.x} ${c.y}) rotate(${c.tilt})`}
                >
                  {Array.from({ length: c.rings }, (_, r) => (
                    <ellipse
                      key={r}
                      rx={c.r * (1 - r * 0.25)}
                      ry={c.r * 0.6 * (1 - r * 0.25)}
                      fill="none"
                      stroke="rgb(122 74 80 / 0.16)"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              ))}
              <path
                d={toPath(PATH.points)}
                fill="none"
                stroke="rgb(156 43 136 / 0.22)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="2 16"
              />
              <path
                d={toPath(TRACK.between(0, p))}
                fill="none"
                stroke="#B23A5E"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray="12 14"
              />
            </svg>

            {Array.from({ length: stepsTaken }, (_, k) => {
              const at = TRACK.at(walk(k * HALF));
              const side = k % 2 ? 1 : -1;
              const rad = ((at.angle + 90) * Math.PI) / 180;
              return (
                <Footprint
                  key={k}
                  x={at.x + Math.cos(rad) * 18 * side}
                  y={at.y + Math.sin(rad) * 18 * side}
                  angle={at.angle}
                  opacity={interpolate(
                    frame - k * HALF,
                    [0, 4, 60],
                    [0, 0.85, 0.45],
                    clamp,
                  )}
                />
              );
            })}

            {STOPS.map((stop, i) => {
              if (i === 0) {
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: stop.x - 67,
                      top: stop.y - 61,
                      scale: landing,
                    }}
                  >
                    <Heart
                      size={134}
                      color="#C2185B"
                      style={{
                        filter: "drop-shadow(0 8px 10px rgb(80 20 40 / 0.4))",
                      }}
                    />
                  </div>
                );
              }
              const last = i === STOPS.length - 1;
              const t = frame - reachedAt[i] + 6;
              const pop = interpolate(t, [0, 14], [0, 1], {
                ...clamp,
                easing: Easing.out(Easing.back(2.2)),
              });
              const w = last ? 470 : 250;
              const h = last ? 580 : 300;
              const tilt = last ? -2 : i % 2 ? -7 : 6;
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      position: "absolute",
                      left: stop.x - w / 2,
                      top: stop.y - h - (last ? 40 : 30),
                      width: w,
                      height: h,
                      transformOrigin: "50% 100%",
                      scale: pop,
                      rotate: `${tilt}deg`,
                    }}
                  >
                    <PhotoCard
                      page={stop.page}
                      width={w}
                      height={h}
                      border={last ? 20 : 12}
                      bottom={last ? 80 : 46}
                      position="center 40%"
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: stop.x - 24,
                      top: stop.y - 40,
                      scale: interpolate(t, [0, 8], [0, 1], {
                        ...clamp,
                        easing: Easing.out(Easing.back(3)),
                      }),
                    }}
                  >
                    <Heart
                      size={48}
                      color="#C2185B"
                      style={{
                        filter: "drop-shadow(0 4px 5px rgb(80 20 40 / 0.4))",
                      }}
                    />
                  </div>
                </React.Fragment>
              );
            })}
            <Burst
              id="arrive"
              x={STOPS[7].x}
              y={STOPS[7].y - 330}
              count={30}
              colors={["#C2185B", "#F28DB2", "#E2BF7A"]}
              spread={620}
            />
          </div>
        </div>

        <Compass frame={frame} />

        {/* The counter of steps still to go. */}
        <div
          className="counter"
          style={{
            position: "absolute",
            left: 540 - 400,
            top: 70,
            width: 800,
            height: 150,
            opacity: 0,
            transform: "translateY(-160px) scale(0.8)",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 22,
            color: "#5A2238",
          }}
        >
          <div
            className="counter-number"
            style={{
              fontFamily: SERIF,
              fontSize: 150,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              minWidth: 290,
              textAlign: "right",
            }}
          >
            {count.toLocaleString("en-US")}
          </div>
          <div style={{ fontFamily: HAND, fontSize: 50, whiteSpace: "nowrap" }}>
            {film.steps}
          </div>
        </div>

        {/* Velvet curtains close at the end, and open on the next scene. */}
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            className={`curtain-${side}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              [side]: 0,
              width: 560,
              transform: `translateX(${side === "left" ? -600 : 600}px)`,
              background:
                "repeating-linear-gradient(90deg, #5E0B1E 0px, #8E1A33 40px, #B02A45 62px, #8E1A33 84px, #5E0B1E 120px)",
              boxShadow:
                side === "left"
                  ? "20px 0 40px rgb(0 0 0 / 0.5)"
                  : "-20px 0 40px rgb(0 0 0 / 0.5)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
