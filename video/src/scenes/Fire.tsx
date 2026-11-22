import { Audio } from "@remotion/media";
import { noise2D } from "@remotion/noise";
import React, { useCallback } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import crackle from "../audio/crackle.mp3";
import fire from "../audio/fire.mp3";
import sparkler from "../audio/sparkler.mp3";
import { CanvasLayer, drawEmbers } from "../lib/Canvas";
import { photo } from "../lib/photos";
import { heartCurve } from "../lib/track";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames: one bar. The scene is cut into the song's jump to its last
// chorus, which happens on the scene's last frame, hidden in a white flare.
const GATHER = [64, 102] as const;
const WORD = 108; // the flames surge on the word about fire
const FLARE = [WORD - 4, 118] as const;

// fire.mp3 roars about 15 frames after it starts.
export const FIRE_ROAR = 15;

const SPARKS = 72;
const HEART = heartCurve(540, 560, 15, SPARKS).slice(0, -1);
const FLAMES = 300;

// Flames rising from the bottom of the frame: glowing blobs that cool from
// white-yellow to red as they rise, in tongues that sway with noise.
const drawFlames = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  strength: number,
) => {
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < FLAMES; i++) {
    const life = 34 + random(`flame-life-${i}`) * 18;
    const age = (frame + random(`flame-offset-${i}`) * life) % life;
    const k = age / life;
    const x0 = random(`flame-x-${i}`) * 1180 - 50;
    // Taller tongues where the noise is high.
    const tongue = 0.55 + 0.45 * noise2D("tongue", x0 * 0.004, frame * 0.03);
    const rise = (440 + random(`flame-rise-${i}`) * 320) * tongue * strength;
    const x = x0 + noise2D("sway", i * 0.37, (frame + age) * 0.04) * 60 * k;
    const y = 1400 - k * rise;
    const r =
      (1 - k * 0.7) *
      (50 + random(`flame-r-${i}`) * 60) *
      (0.7 + 0.3 * strength);
    const color =
      k < 0.18
        ? "255 236 170"
        : k < 0.45
          ? "255 158 52"
          : k < 0.75
            ? "226 72 24"
            : "120 24 12";
    const alpha = (k < 0.1 ? k / 0.1 : 1 - (k - 0.1) / 0.9) * 0.62;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgb(${color} / ${alpha})`);
    g.addColorStop(1, `rgb(${color} / 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
};

// Sparks drifting up that gather into a heart, then burst on the word.
const drawSparks = (ctx: CanvasRenderingContext2D, frame: number) => {
  ctx.globalCompositeOperation = "lighter";
  const gather = interpolate(frame, GATHER, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const burst = frame > WORD ? frame - WORD : 0;
  HEART.forEach((target, i) => {
    const speed = 4 + random(`spark-v-${i}`) * 5;
    const freeX =
      random(`spark-x-${i}`) * 1080 + Math.sin(frame * 0.06 + i) * 30;
    const freeY =
      1350 - ((frame * speed + random(`spark-y-${i}`) * 1350) % 1350);
    let x = freeX + (target.x - freeX) * gather;
    let y = freeY + (target.y - freeY) * gather;
    if (burst) {
      const dx = target.x - 540;
      const dy = target.y - 600;
      x += dx * burst * 0.25;
      y += dy * burst * 0.25;
    }
    const shimmer = 0.7 + 0.3 * Math.sin(frame * 0.5 + i * 1.7);
    const size =
      (2.4 + gather * 2.2) * (burst ? Math.max(0, 1 - burst / 14) : 1);
    if (size <= 0) {
      return;
    }
    const g = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
    g.addColorStop(0, `rgb(255 244 214 / ${shimmer})`);
    g.addColorStop(0.3, `rgb(255 170 70 / ${shimmer * 0.6})`);
    g.addColorStop(1, "rgb(255 120 40 / 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size * 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
};

// Bar 17, the end of the chorus: fire. Her photo in golden light, flames
// rising from the bottom, sparks gathering into a heart in front of her; on
// the word the flames surge and the frame flares white.
export const Fire: React.FC = () => {
  const frame = useCurrentFrame();
  const strength = interpolate(
    frame,
    [0, 8, WORD - 6, WORD + 8],
    [1.25, 0.8, 1.05, 2.4],
    clamp,
  );
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, f: number) => {
      drawFlames(ctx, f, strength);
      drawEmbers(ctx, f, { count: 70, seed: "fire-embers", rgb: "255 176 90" });
      drawSparks(ctx, f);
    },
    [strength],
  );
  const push = interpolate(frame, [0, 120], [1.12, 1.0], clamp);
  const flare = interpolate(frame, FLARE, [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const flicker = 0.85 + 0.15 * noise2D("flicker", frame * 0.2, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A0704", overflow: "hidden" }}>
      <Audio src={crackle} from={6} volume={0.45} />
      <Audio src={crackle} from={60} volume={0.4} />
      <Audio src={sparkler} from={GATHER[0]} volume={0.25} />
      <Audio src={fire} from={WORD - FIRE_ROAR} volume={0.75} />

      <AbsoluteFill style={{ scale: push }}>
        <Img
          src={photo(455)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            filter: `brightness(${0.85 * flicker}) saturate(1.05)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: "rgb(210 70 24 / 0.55)",
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgb(30 8 4 / 0.15) 0%, transparent 35%, rgb(80 20 6 / 0.5) 75%, rgb(40 8 2 / 0.9) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 50% at 50% 100%, rgb(255 120 30 / 0.45), transparent 75%)",
          opacity: flicker,
          mixBlendMode: "screen",
        }}
      />
      <CanvasLayer draw={draw} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 70% at 50% 55%, #FFFDF4 0%, #FFE7B0 45%, #FFB45A 100%)",
          opacity: flare,
        }}
      />
    </AbsoluteFill>
  );
};
