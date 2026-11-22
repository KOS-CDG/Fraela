import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import ding from "../audio/ding.wav";
import flip from "../audio/flip.wav";
import heartbeat from "../audio/heartbeat.wav";
import riser from "../audio/riser.mp3";
import sparkle from "../audio/sparkle.mp3";
import { one, useAnimeTimeline } from "../lib/anime";
import { content } from "../lib/content";
import { HAND, SERIF } from "../lib/fonts";
import { photo } from "../lib/photos";
import { Moon, MoonPhase, Stars } from "../lib/Sky";
import { Sparkles } from "../lib/Sparkles";
import { heartCurve, toPath } from "../lib/track";
import { BAR, HALF, ms } from "../timeline";

const film = content.film;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames: four bars.
const ZOOM = BAR;
const GLOW = 169; // the moon lights up on the word about moonlight
const MONTAGE = 2 * BAR;
const STARS = 3 * BAR;
const BLUSH = 4 * BAR - 16;

// The moon: drawn at its biggest and scaled down while it rises.
const MOON_SIZE = 760;
const MOON_CENTER = { x: 540, y: 640 };
// It rises from behind the skyline (masked below SKYLINE) into the sky.
const RISE = { x: 230, from: -260, to: -490, scale: 0.22 };
const SKYLINE = 300;

// Bar 3: eight nights on the terrace, one per eighth note, while the moon
// waxes along the top and the nights add up to a year.
const MONTAGE_PHOTOS = [410, 427, 443, 555, 565, 617, 416, 659];
const PHASES = [0.08, 0.2, 0.33, 0.5, 0.64, 0.78, 0.9, 1];

// Bar 4: a constellation in the shape of a heart around her.
const CONSTELLATION = heartCurve(540, 640, 28, 16).slice(0, -1);
const STAR_EVERY = 5;

// Bars 7 to 10, the rest of the first verse: night. The moon rises over the
// city she is looking at, fills the frame with her face in it on the word, the
// nights of the year flick past, and the stars join into a heart.
export const Moonlight: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    const moon = one(el, ".moon");
    tl.add(
      moon,
      {
        opacity: { from: 0, to: 1, duration: 700 },
        x: [RISE.x, RISE.x],
        y: [RISE.from, RISE.to],
        scale: [RISE.scale, RISE.scale],
        duration: ms(ZOOM - 8),
        ease: "outSine",
      },
      ms(8),
    );
    tl.add(
      moon,
      {
        x: [RISE.x, 0],
        y: [RISE.to, 0],
        scale: [RISE.scale, 1],
        duration: ms(40),
        ease: "inOutCubic",
      },
      ms(ZOOM),
    );
    tl.add(
      moon,
      {
        scale: [
          { to: 1.06, duration: 120, ease: "outQuad" },
          { to: 1, duration: 600, ease: "outElastic(1, .5)" },
        ],
      },
      ms(GLOW),
    );
    tl.add(
      moon,
      {
        scale: [1, 0.08],
        y: [0, -560],
        x: [0, 330],
        opacity: [1, 0],
        duration: ms(14),
        ease: "inQuart",
      },
      ms(MONTAGE - 12),
    );
    tl.add(
      one(el, ".count"),
      {
        scale: [
          { from: 1, to: 1.25, duration: 100, ease: "outQuad" },
          { to: 1, duration: 400, ease: "outElastic(1, .4)" },
        ],
      },
      ms(STARS - 8),
    );
    tl.add(
      one(el, ".constellation"),
      {
        scale: [
          { from: 1, to: 1.12, duration: 110, ease: "outQuad" },
          { to: 1.02, duration: 180, ease: "inOutQuad" },
          { to: 1.2, duration: 110, ease: "outQuad" },
        ],
      },
      ms(BLUSH - 6),
    );
  });

  // Bar 1: the city at night, slowly pushing in; bar 2: diving into the moon.
  const cityPush = interpolate(frame, [0, ZOOM + 30], [1.0, 1.14], clamp);
  const cityFade = interpolate(frame, [ZOOM + 6, ZOOM + 34], [1, 0], clamp);
  const arrive = interpolate(frame, [0, 16], [-1400, 0], {
    ...clamp,
    easing: Easing.out(Easing.poly(4)),
  });
  const horizon = interpolate(frame, [ZOOM, ZOOM + 12], [SKYLINE, 1400], clamp);
  const face = interpolate(frame, [ZOOM + 18, GLOW + 4], [0, 0.88], clamp);
  const rays = interpolate(
    frame,
    [GLOW - 2, GLOW + 8, MONTAGE - 10],
    [0, 1, 0.5],
    clamp,
  );
  // Bar 3: the montage.
  const shot = Math.min(7, Math.max(0, Math.floor((frame - MONTAGE) / HALF)));
  const inShot = (frame - MONTAGE) % HALF;
  const montageOn = frame >= MONTAGE && frame < STARS;
  const nights = Math.round(
    interpolate(frame, [MONTAGE, STARS - 8], [1, 365], {
      ...clamp,
      easing: Easing.in(Easing.quad),
    }),
  );
  const cutFlash = montageOn
    ? interpolate(inShot, [0, 5], [0.35, 0], clamp)
    : 0;
  // Bar 4: the constellation.
  const skyOn = frame >= STARS - 4;
  const lit = Math.floor((frame - STARS) / STAR_EVERY) + 1;
  const linePath = toPath(
    CONSTELLATION.slice(0, Math.max(0, Math.min(CONSTELLATION.length, lit))),
  );
  const closed = lit > CONSTELLATION.length;
  const blush = interpolate(frame, [BLUSH - 6, 4 * BAR], [0, 1], clamp);
  const portrait = interpolate(frame, [STARS, STARS + 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07040B", overflow: "hidden" }}>
      <Audio src={sparkle} from={10} volume={0.2} />
      <Audio src={riser} from={GLOW - 55} volume={0.28} />
      <Audio src={sparkle} from={GLOW} volume={0.35} />
      {MONTAGE_PHOTOS.map((page, i) => (
        <Audio key={page} src={flip} from={MONTAGE + i * HALF} volume={0.32} />
      ))}
      <Audio src={sparkle} from={STARS} volume={0.3} />
      <Audio
        src={ding}
        from={STARS + CONSTELLATION.length * STAR_EVERY}
        volume={0.3}
      />
      <Audio src={heartbeat} from={BLUSH - 6} volume={0.55} />

      {/* The night sky stays put while the scene drops in from above. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(100% 70% at 50% 40%, #1D0E2E 0%, #0E0718 60%, #07040B 100%)",
        }}
      />
      <Stars frame={frame} count={160} seed="moon-stars" />
      <div
        ref={root}
        style={{ position: "absolute", inset: 0, translate: `0px ${arrive}px` }}
      >
        {/* Bar 1: the city she is looking at. */}
        <AbsoluteFill style={{ opacity: cityFade }}>
          <AbsoluteFill
            style={{
              scale: cityPush,
              transformOrigin: `${540 + RISE.x}px 150px`,
            }}
          >
            <Img
              src={photo(448)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 40%",
              }}
            />
            <AbsoluteFill
              style={{
                background:
                  "linear-gradient(180deg, rgb(10 6 20 / 0.7) 0%, rgb(10 6 20 / 0.1) 35%, transparent 60%, rgb(10 6 20 / 0.5) 100%)",
              }}
            />
            <Stars
              frame={frame}
              count={50}
              seed="city-stars"
              height={420}
              style={{ mixBlendMode: "screen" }}
            />
          </AbsoluteFill>
        </AbsoluteFill>

        {/* Bar 2: moonbeams behind the moon. */}
        <div
          style={{
            position: "absolute",
            left: MOON_CENTER.x - 900,
            top: MOON_CENTER.y - 900,
            width: 1800,
            height: 1800,
            borderRadius: "50%",
            opacity: rays * 0.55,
            rotate: `${frame * 0.25}deg`,
            background:
              "repeating-conic-gradient(from 0deg, rgb(255 236 214 / 0.3) 0deg 4deg, transparent 4deg 15deg)",
            WebkitMaskImage:
              "radial-gradient(closest-side, #000 20%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `linear-gradient(180deg, #000 ${horizon}px, transparent ${horizon + 30}px)`,
          }}
        >
          <div
            className="moon"
            style={{
              position: "absolute",
              left: MOON_CENTER.x - MOON_SIZE / 2,
              top: MOON_CENTER.y - MOON_SIZE / 2,
              width: MOON_SIZE,
              height: MOON_SIZE,
              opacity: 0,
              transform: `translateX(${RISE.x}px) translateY(${RISE.from}px) scale(${RISE.scale})`,
            }}
          >
            <Moon size={MOON_SIZE} halo={0.6 + rays * 0.4}>
              <Img
                src={photo(414)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 30%",
                  opacity: face,
                  mixBlendMode: "luminosity",
                  WebkitMaskImage:
                    "radial-gradient(closest-side, #000 62%, transparent 100%)",
                }}
              />
            </Moon>
          </div>
        </div>
        {frame >= GLOW && frame < MONTAGE ? (
          <Sparkles count={18} color="#FFF1DC" seed="moonlight" start={GLOW} />
        ) : null}

        {/* Bar 3: the nights of the year. */}
        {montageOn ? (
          <AbsoluteFill>
            <AbsoluteFill
              style={{ scale: interpolate(inShot, [0, HALF], [1.08, 1.02]) }}
            >
              <Img
                src={photo(MONTAGE_PHOTOS[shot])}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 45%",
                }}
              />
            </AbsoluteFill>
            <AbsoluteFill
              style={{
                background:
                  "linear-gradient(180deg, rgb(8 4 14 / 0.75) 0%, transparent 26%, transparent 62%, rgb(8 4 14 / 0.85) 100%)",
              }}
            />
            <AbsoluteFill
              style={{ backgroundColor: "#FFF4E8", opacity: cutFlash }}
            />
          </AbsoluteFill>
        ) : null}
        {/* The anime.js targets in here exist on every frame; only their opacity changes. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [MONTAGE - 6, MONTAGE, STARS, STARS + 10],
              [0, 1, 1, 0],
              clamp,
            ),
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 92,
              display: "flex",
              justifyContent: "center",
              gap: 26,
            }}
          >
            {PHASES.map((phase, i) => (
              <div
                key={i}
                style={{
                  scale: i <= shot ? 1 : 0.8,
                  opacity: i <= shot ? 1 : 0.5,
                }}
              >
                <MoonPhase size={74} phase={i <= shot ? phase : 0} />
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 110,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 26,
              color: "#FFF4E8",
            }}
          >
            <div
              className="count"
              style={{
                fontFamily: SERIF,
                fontSize: 210,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                minWidth: 330,
                textAlign: "right",
                textShadow: "0 6px 30px rgb(0 0 0 / 0.5)",
              }}
            >
              {nights}
            </div>
            <div
              style={{
                fontFamily: HAND,
                fontSize: 64,
                textShadow: "0 4px 18px rgb(0 0 0 / 0.6)",
              }}
            >
              {film.nights}
            </div>
          </div>
        </AbsoluteFill>

        {/* Bar 4: the constellation. */}
        <AbsoluteFill style={{ display: skyOn ? "block" : "none" }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(70% 50% at 50% 48%, #2A1240 0%, #12081F 60%, #07040B 100%)",
            }}
          />
          <Stars frame={frame} count={220} seed="constellation-sky" />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(60% 45% at 50% 48%, #8E1F3E 0%, #4A0C22 55%, transparent 100%)",
              opacity: blush,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 540 - 190,
              top: 720 - 190,
              width: 380,
              height: 380,
              borderRadius: "50%",
              overflow: "hidden",
              opacity: portrait,
              scale: 0.85 + portrait * 0.15,
              boxShadow:
                "0 0 0 6px rgb(255 244 232 / 0.85), 0 0 80px rgb(242 141 178 / 0.5)",
            }}
          >
            {skyOn ? (
              <Img
                src={photo(442)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 42%",
                }}
              />
            ) : null}
          </div>
          <div
            className="constellation"
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "540px 680px",
            }}
          >
            <svg
              width={1080}
              height={1350}
              style={{ position: "absolute", inset: 0 }}
            >
              <path
                d={closed ? `${toPath(CONSTELLATION)} Z` : linePath}
                fill="none"
                stroke={
                  blush > 0
                    ? `rgb(255 ${Math.round(236 - blush * 120)} ${Math.round(214 - blush * 110)})`
                    : "#FFECD6"
                }
                strokeWidth={3}
                strokeOpacity={0.7}
                strokeDasharray={closed ? undefined : "10 8"}
              />
            </svg>
            {CONSTELLATION.map((point, i) => {
              const t = frame - (STARS + i * STAR_EVERY);
              if (t < 0) {
                return null;
              }
              const pop = interpolate(t, [0, 4, 10], [0, 1.6, 1], clamp);
              const twinkle = 0.75 + 0.25 * Math.sin(frame * 0.4 + i);
              return (
                <svg
                  key={i}
                  viewBox="-10 -10 20 20"
                  width={34}
                  height={34}
                  style={{
                    position: "absolute",
                    left: point.x - 17,
                    top: point.y - 17,
                    scale: pop * twinkle,
                    filter: "drop-shadow(0 0 8px rgb(255 236 214 / 0.9))",
                  }}
                >
                  <path
                    d="M0 -10C1 -2 2 -1 10 0C2 1 1 2 0 10C-1 2 -2 1 -10 0C-2 -1 -1 -2 0 -10Z"
                    fill={blush > 0.5 ? "#FFC2D1" : "#FFF4E0"}
                  />
                </svg>
              );
            })}
          </div>
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
