import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import ding from "../audio/ding.wav";
import paper from "../audio/paper.wav";
import pop from "../audio/pop.mp3";
import shutter from "../audio/shutter.wav";
import sparkle from "../audio/sparkle.mp3";
import whip from "../audio/whip.wav";
import whoosh from "../audio/whoosh.mp3";
import { all, data, one, useAnimeTimeline } from "../lib/anime";
import { addBurst, Burst } from "../lib/Burst";
import { content } from "../lib/content";
import { SANS } from "../lib/fonts";
import { RisingHearts } from "../lib/Hearts";
import { PhotoCard } from "../lib/PhotoCard";
import { PAPER } from "../lib/Postcard";
import { photo } from "../lib/photos";
import { Stars } from "../lib/Sky";
import {
  distance,
  heartCurve,
  inside,
  makeTrack,
  type Point,
  toPath,
} from "../lib/track";
import { BAR, BEAT, ms } from "../timeline";

const film = content.film;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames. The band comes in on the first frame.
const LAUNCH = 84; // the singer's first word, about sending
const FLY = [BAR - 2, 2 * BAR - 28] as const;
const THROUGH = 167; // the plane goes through a cloud on the word
const DELIVERED = FLY[1];
const RECEIVED = 2 * BAR;
const TILT = 3 * BAR - 16;

// Bar 1: a flock of small postcards takes off and three land in a pile.
const FLOCK_PHOTOS = [
  192, 210, 311, 320, 429, 438, 480, 805, 729, 630, 37, 292, 459, 442,
];
const FLOCK = FLOCK_PHOTOS.map((page, i) => ({
  page,
  angle: (random(`flock-angle-${i}`) - 0.5) * 2.2,
  delay: Math.floor(random(`flock-delay-${i}`) * 16),
  x0: 540 + (random(`flock-x-${i}`) - 0.5) * 360,
  distance: 1500 + random(`flock-distance-${i}`) * 700,
  life: 38 + random(`flock-life-${i}`) * 26,
  size: 0.75 + random(`flock-size-${i}`) * 0.6,
  phase: random(`flock-phase-${i}`) * Math.PI * 2,
}));
const PILE = [
  { page: 198, from: { x: -1000, y: 60, rotate: -32 }, rotate: -7, at: 0 },
  { page: 294, from: { x: 1000, y: -40, rotate: 28 }, rotate: 5, at: BEAT },
  { page: 783, from: { x: 0, y: 1300, rotate: 14 }, rotate: -2, at: 2 * BEAT },
];

// Bars 2 and 3: a paper plane flies in, draws a heart with one loop, then
// flies straight through it, so its trail becomes an arrow through a heart.
const HEART = heartCurve(540, 640, 20);
const CENTER = { x: 540, y: 690 };
const ANGLE = -34;
const DIR = {
  x: Math.cos((ANGLE * Math.PI) / 180),
  y: Math.sin((ANGLE * Math.PI) / 180),
};
const along = (from: Point, d: number): Point => ({
  x: from.x + DIR.x * d,
  y: from.y + DIR.y * d,
});
// Where the arrow's line leaves the heart, walking from the centre one way.
const edge = (sign: number) => {
  let d = 0;
  while (inside(along(CENTER, sign * d), HEART) && d < 1000) {
    d += 1;
  }
  return along(CENTER, sign * d);
};
const ENTRY = edge(-1);
const EXIT = edge(1);
const TAIL = along(ENTRY, -250);
const TIP = along(EXIT, 230);
const nearest = HEART.slice(0, -1).reduce(
  (best, point, i) =>
    distance(point, ENTRY) < distance(HEART[best], ENTRY) ? i : best,
  0,
);
// The loop runs anticlockwise from the entry point: down to the tip first.
const LOOP = [
  ...HEART.slice(0, nearest + 1).reverse(),
  ...HEART.slice(nearest + 1, -1).reverse(),
  HEART[nearest],
];
const ROUTE_POINTS = [
  along(TAIL, -700),
  TAIL,
  ENTRY,
  ...LOOP,
  EXIT,
  TIP,
  along(TIP, 900),
];
const ROUTE = makeTrack(ROUTE_POINTS);
const TRAIL_START = ROUTE.progressOf(distance(ROUTE_POINTS[0], TAIL));
const TRAIL_END = 1 - ROUTE.progressOf(900);
const flight = (frame: number) =>
  interpolate(frame, FLY, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
const CLOUD = ROUTE.at(flight(THROUGH));
const PUFFS = [
  [-120, 12, 120],
  [-60, -26, 150],
  [10, -44, 175],
  [84, -22, 150],
  [140, 14, 115],
  [-20, 22, 165],
  [60, 26, 150],
  [-170, 32, 90],
  [190, 36, 85],
  [0, 4, 190],
].map(([x, y, size], i) => ({
  x: CLOUD.x + x,
  y: CLOUD.y + y,
  size,
  dx: x * 2.1 + (random(`puff-dx-${i}`) - 0.5) * 60,
  dy: y * 2.4 + (random(`puff-dy-${i}`) - 0.5) * 60,
}));

// Bar 3: the polaroid in the heart, a new photo on every beat.
const POLAROID = [138, 836, 744, 820];
const POLAROID_POSITION: Record<number, string> = {
  138: "center 30%",
  836: "center 50%",
  744: "center 40%",
  820: "center 45%",
};

const Plane: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg viewBox="-30 -20 60 40" width={size} height={(size * 2) / 3}>
    <path d="M28 0 L-26 -17 L-11 0 L-26 17 Z" fill="#FFFDF8" />
    <path d="M28 0 L-11 0 L-17 11 Z" fill="#E7C3D3" />
  </svg>
);

const Check: React.FC = () => (
  <svg width={34} height={34} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={12} fill="#F28DB2" />
    <path
      d="M6.5 12.5l3.5 3.5 7.5-8"
      fill="none"
      stroke="#fff"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Bars 4 to 6 of the song, the first verse: the postcard is sent, flies, and
// arrives. Postcards take off as the band comes in, a paper plane traces a
// heart across the night, and a polaroid of her lands inside it.
export const Sent: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    PILE.forEach((card, i) => {
      tl.add(
        one(el, `.pile-${i}`),
        {
          x: [card.from.x, 0],
          y: [card.from.y, 0],
          rotate: [card.from.rotate, card.rotate],
          duration: 520,
          ease: "outBack(1.3)",
        },
        ms(card.at),
      );
    });
    tl.add(
      one(el, ".pile"),
      {
        y: [0, -1600],
        scale: [1, 0.5],
        rotate: [0, -14],
        duration: ms(22),
        ease: "inBack(1.6)",
      },
      ms(LAUNCH - 4),
    );
    tl.add(
      one(el, ".pill"),
      {
        opacity: [0, 1],
        y: [-70, 0],
        scale: [0.85, 1],
        duration: 520,
        ease: "outBack(1.5)",
      },
      ms(FLY[0]),
    );
    tl.add(
      one(el, ".pill"),
      {
        scale: [
          { to: 1.14, duration: 90, ease: "outQuad" },
          { to: 1, duration: 420, ease: "outElastic(1, .45)" },
        ],
      },
      ms(DELIVERED),
    );
    tl.add(
      one(el, ".pill"),
      { opacity: [1, 0], y: [0, -90], duration: 320, ease: "inQuad" },
      ms(RECEIVED + 22),
    );
    tl.add(
      all(el, ".puff"),
      {
        x: data("dx"),
        y: data("dy"),
        scale: [1, 1.7],
        opacity: [0.85, 0],
        duration: 800,
        ease: "outQuart",
      },
      ms(THROUGH),
    );
    addBurst(tl, el, "delivered", ms(DELIVERED));
    tl.add(
      [one(el, ".arrow-tail"), one(el, ".arrow-tip")],
      { scale: [0, 1], duration: 420, ease: "outBack(2.2)" },
      ms(DELIVERED - 4),
    );
    tl.add(
      one(el, ".polaroid"),
      {
        opacity: [0, 1],
        scale: [1.5, 1],
        rotate: [-12, -3],
        duration: 480,
        ease: "outExpo",
      },
      ms(RECEIVED),
    );
    [1, 2, 3].forEach((beat) => {
      tl.add(
        one(el, ".polaroid"),
        {
          scale: [
            { to: 1.05, duration: 70, ease: "outQuad" },
            { to: 1, duration: 260, ease: "outQuad" },
          ],
          rotate: [
            { to: beat % 2 ? 2 : -3, duration: 330, ease: "outBack(2)" },
          ],
        },
        ms(RECEIVED + beat * BEAT),
      );
    });
  });

  // The band hits: a flash and a shake.
  const flash = interpolate(frame, [0, 10], [0.55, 0], clamp);
  const shake = frame < 9 ? (9 - frame) * Math.sin(frame * 2.6) * 1.6 : 0;
  const dusk = interpolate(frame, [90, 134], [1, 0], clamp);
  const starsIn = interpolate(frame, [96, 140], [0, 1], clamp);
  const p = flight(frame);
  const plane = ROUTE.at(p);
  const planeOn = frame >= FLY[0] && frame <= FLY[1] + 4;
  const trailFade = interpolate(
    frame,
    [RECEIVED + 10, RECEIVED + 40],
    [1, 0.35],
    clamp,
  );
  const heartGlow = interpolate(
    frame,
    [DELIVERED - 6, RECEIVED],
    [0, 1],
    clamp,
  );
  const beat = Math.min(3, Math.max(0, Math.floor((frame - RECEIVED) / BEAT)));
  const shot = frame >= RECEIVED ? (frame - RECEIVED) % BEAT : 99;
  const shotFlash = interpolate(shot, [0, 8], [0.6, 0], clamp);
  const tilt = interpolate(frame, [TILT, 3 * BAR], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07040B", overflow: "hidden" }}>
      <Audio src={whip} from={0} volume={0.5} />
      <Audio src={whip} from={BEAT} volume={0.45} />
      <Audio src={paper} from={2 * BEAT} volume={0.6} />
      <Audio src={whoosh} from={LAUNCH - 8} volume={0.6} />
      <Audio src={sparkle} from={LAUNCH} volume={0.2} />
      <Audio src={whoosh} from={THROUGH - 14} volume={0.35} />
      <Audio src={ding} from={DELIVERED} volume={0.45} />
      <Audio src={pop} from={DELIVERED} volume={0.4} />
      {POLAROID.map((page, i) => (
        <Audio
          key={page}
          src={shutter}
          from={RECEIVED + i * BEAT}
          volume={0.5}
        />
      ))}
      <Audio src={whoosh} from={TILT - 6} volume={0.45} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${shake}px ${shake * 0.6}px`,
        }}
      >
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(120% 80% at 50% 110%, #4E1C4D 0%, #2A0F33 42%, #12081C 74%, #07040B 100%)",
          }}
        />
        <Stars
          frame={frame}
          count={170}
          seed="sent-stars"
          style={{ opacity: starsIn, translate: `0px ${tilt * 500}px` }}
        />
        <AbsoluteFill
          style={{
            opacity: dusk,
            background:
              "linear-gradient(180deg, #2B1240 0%, #6B2A63 38%, #C2567E 70%, #F2A07B 100%)",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: random(`cloud-x-${i}`) * 1080 - 300,
                top:
                  ((random(`cloud-y-${i}`) * 1600 + frame * (5 + i * 2)) %
                    1900) -
                  400,
                width: 600 + i * 80,
                height: 180 + i * 20,
                borderRadius: "50%",
                background:
                  "radial-gradient(closest-side, rgb(255 226 228 / 0.42), transparent)",
                filter: "blur(6px)",
              }}
            />
          ))}
        </AbsoluteFill>

        <div ref={root} style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate: `0px ${tilt * 1500}px`,
            }}
          >
            {/* Bar 1: the flock and the pile. */}
            {FLOCK.map((card, i) => {
              const t = frame - card.delay;
              if (t < 0 || t > card.life) {
                return null;
              }
              const k = t / card.life;
              const d = card.distance * (1 - (1 - k) ** 2.2);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: card.x0 + Math.sin(card.angle) * d - 70,
                    top: 1450 - Math.cos(card.angle) * d - 88,
                    width: 140,
                    height: 176,
                    padding: 8,
                    boxSizing: "border-box",
                    backgroundColor: PAPER,
                    boxShadow: "0 10px 24px rgb(0 0 0 / 0.35)",
                    transform: `rotate(${card.angle * 40}deg) rotateY(${Math.sin(t * 0.55 + card.phase) * 55}deg) scale(${card.size * (1 - 0.35 * k)})`,
                  }}
                >
                  <Img
                    src={photo(card.page)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              );
            })}

            <div className="pile" style={{ position: "absolute", inset: 0 }}>
              {PILE.map((card, i) => (
                <div
                  key={card.page}
                  className={`pile-${i}`}
                  style={{
                    position: "absolute",
                    left: 540 - 290,
                    top: 675 - 360,
                    width: 580,
                    height: 720,
                    transform: `translateX(${card.from.x}px) translateY(${card.from.y}px) rotate(${card.from.rotate}deg)`,
                  }}
                >
                  <PhotoCard
                    page={card.page}
                    width={580}
                    height={720}
                    border={18}
                    position="center 40%"
                  />
                </div>
              ))}
            </div>

            {/* Bars 2 and 3: the plane, its dotted trail and the heart it draws. */}
            <svg
              width={1080}
              height={1350}
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              <defs>
                <radialGradient id="sent-heart" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#F28DB2" stopOpacity={0.55} />
                  <stop offset="70%" stopColor="#9C2B88" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#9C2B88" stopOpacity={0} />
                </radialGradient>
              </defs>
              <path
                d={toPath(HEART)}
                fill="url(#sent-heart)"
                opacity={heartGlow}
              />
              <path
                d={toPath(HEART)}
                fill="none"
                stroke="#F7B9CF"
                strokeWidth={14}
                opacity={heartGlow * 0.35}
                style={{ filter: "blur(10px)" }}
              />
              {frame >= FLY[0] ? (
                <path
                  d={toPath(ROUTE.between(TRAIL_START, Math.min(p, TRAIL_END)))}
                  fill="none"
                  stroke="#FBEFF6"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray="0.1 19"
                  opacity={0.9 * trailFade}
                />
              ) : null}
            </svg>
            <div
              className="arrow-tail"
              style={{
                position: "absolute",
                left: TAIL.x - 40,
                top: TAIL.y - 40,
                width: 80,
                height: 80,
                opacity: trailFade,
                transform: "scale(0)",
              }}
            >
              <svg
                width={80}
                height={80}
                viewBox="-40 -40 80 80"
                style={{ overflow: "visible" }}
              >
                <g
                  transform={`rotate(${ANGLE})`}
                  stroke="#FBEFF6"
                  strokeWidth={6}
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M6 0 L-22 -24 M6 0 L-22 24 M-14 0 L-42 -24 M-14 0 L-42 24" />
                </g>
              </svg>
            </div>
            <div
              className="arrow-tip"
              style={{
                position: "absolute",
                left: TIP.x - 40,
                top: TIP.y - 40,
                width: 80,
                height: 80,
                opacity: trailFade,
                transform: "scale(0)",
              }}
            >
              <svg
                width={80}
                height={80}
                viewBox="-40 -40 80 80"
                style={{ overflow: "visible" }}
              >
                <path
                  transform={`rotate(${ANGLE})`}
                  d="M26 0 L-22 -24 L-12 0 L-22 24 Z"
                  fill="#FBEFF6"
                />
              </svg>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: starsIn }}>
              {PUFFS.map((puff, i) => (
                <div
                  key={i}
                  className="puff"
                  data-dx={puff.dx.toFixed(1)}
                  data-dy={puff.dy.toFixed(1)}
                  style={{
                    position: "absolute",
                    left: puff.x - puff.size / 2,
                    top: puff.y - puff.size / 2,
                    width: puff.size,
                    height: puff.size * 0.7,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(closest-side, rgb(255 240 246 / 0.75), rgb(255 240 246 / 0.2) 70%, transparent)",
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            {planeOn ? (
              <div
                style={{
                  position: "absolute",
                  left: plane.x - 45,
                  top: plane.y - 30,
                  width: 90,
                  height: 60,
                  rotate: `${plane.angle}deg`,
                  filter: "drop-shadow(0 6px 10px rgb(0 0 0 / 0.4))",
                }}
              >
                <Plane size={90} />
              </div>
            ) : null}

            {/* Bar 3: the polaroid. */}
            <div
              className="polaroid"
              style={{
                position: "absolute",
                left: 540 - 235,
                top: 690 - 290,
                width: 470,
                height: 580,
                opacity: 0,
                transform: "scale(1.5) rotate(-12deg)",
              }}
            >
              <PhotoCard
                page={POLAROID[beat]}
                width={470}
                height={580}
                border={22}
                bottom={96}
                position={POLAROID_POSITION[POLAROID[beat]]}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#fff",
                    opacity: shotFlash,
                  }}
                />
              </PhotoCard>
            </div>
            {frame >= RECEIVED ? (
              <RisingHearts
                frame={frame}
                start={RECEIVED}
                count={22}
                seed="sent-hearts"
                colors={["#F28DB2", "#F7B9CF", "#E2BF7A", "#FBEFF6"]}
              />
            ) : null}
          </div>

          {/* The status pill at the top. */}
          <div
            className="pill"
            style={{
              position: "absolute",
              left: 540 - 260,
              top: 110,
              width: 520,
              height: 100,
              opacity: 0,
              transform: "translateY(-70px) scale(0.85)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 50,
                backgroundColor: "rgb(255 255 255 / 0.16)",
                backdropFilter: "blur(20px) saturate(1.3)",
                boxShadow: "inset 0 0 0 1.5px rgb(255 255 255 / 0.18)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 30px",
                fontFamily: SANS,
                fontSize: 38,
                fontWeight: 600,
                color: "#FFF",
              }}
            >
              {frame < DELIVERED ? (
                <>
                  <Plane size={44} />
                  <span>{film.sending}</span>
                </>
              ) : (
                <>
                  <Check />
                  <span>{film.delivered}</span>
                </>
              )}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  height: 5,
                  width: `${p * 100}%`,
                  backgroundColor: "#F28DB2",
                  opacity: frame < DELIVERED ? 1 : 0,
                }}
              />
            </div>
          </div>
          <Burst
            id="delivered"
            x={540}
            y={160}
            count={18}
            colors={["#F28DB2", "#FBEFF6", "#E2BF7A"]}
            spread={260}
          />
        </div>

        <AbsoluteFill
          style={{
            backgroundColor: "#FFE9F1",
            opacity: flash,
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
