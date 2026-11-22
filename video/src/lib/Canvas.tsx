import React, { useLayoutEffect, useRef } from "react";
import { random, useCurrentFrame } from "remotion";

type Draw = (ctx: CanvasRenderingContext2D, frame: number) => void;

// A full-frame canvas redrawn from scratch on every frame, for particles that
// would be too many for DOM elements. `draw` must depend only on the frame.
// `density` adds pixels for a canvas that the camera will enlarge.
export const CanvasLayer: React.FC<{
  readonly draw: Draw;
  readonly width?: number;
  readonly height?: number;
  readonly density?: number;
  readonly style?: React.CSSProperties;
}> = ({ draw, width = 1080, height = 1350, density = 1, style }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width * density, height * density);
    ctx.setTransform(density, 0, 0, density, 0, 0);
    draw(ctx, frame);
  }, [draw, frame, width, height, density]);

  return (
    <canvas
      ref={ref}
      width={width * density}
      height={height * density}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        ...style,
      }}
    />
  );
};

const glowDot = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rgb: string,
  alpha: number,
) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `rgb(${rgb} / ${alpha})`);
  g.addColorStop(0.25, `rgb(${rgb} / ${alpha * 0.45})`);
  g.addColorStop(1, `rgb(${rgb} / 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgb(255 250 240 / ${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
};

export type Firework = {
  readonly x: number;
  readonly y: number;
  readonly at: number;
  readonly rgb: string;
  readonly count?: number;
  readonly radius?: number;
  readonly heart?: boolean;
};

const LAUNCH = 16;

// Rockets that rise for LAUNCH frames and burst at `at`, into a ring or a
// heart of sparks that slow down, fall and fade, leaving short trails.
export const drawFireworks = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  shows: readonly Firework[],
  height = 1350,
) => {
  ctx.globalCompositeOperation = "lighter";
  shows.forEach((show, s) => {
    const t = frame - show.at;
    if (t < -LAUNCH || t > 70) {
      return;
    }
    if (t < 0) {
      const k = 1 + t / LAUNCH;
      const ease = 1 - (1 - k) ** 2;
      const y = height + 40 - (height + 40 - show.y) * ease;
      const x = show.x + Math.sin(k * 6 + s) * 6;
      ctx.strokeStyle = `rgb(${show.rgb} / 0.5)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 60);
      ctx.lineTo(x, y);
      ctx.stroke();
      glowDot(ctx, x, y, 3, show.rgb, 0.9);
      return;
    }
    const count = show.count ?? 70;
    const radius = show.radius ?? 260;
    const flash = Math.max(0, 1 - t / 6);
    if (flash > 0) {
      glowDot(ctx, show.x, show.y, 26, show.rgb, flash * 0.8);
    }
    for (let i = 0; i < count; i++) {
      let dx: number;
      let dy: number;
      if (show.heart) {
        const a = (i / count) * Math.PI * 2;
        dx = (16 * Math.sin(a) ** 3) / 16;
        dy =
          -(
            13 * Math.cos(a) -
            5 * Math.cos(2 * a) -
            2 * Math.cos(3 * a) -
            Math.cos(4 * a)
          ) / 16;
      } else {
        const a = (i / count) * Math.PI * 2 + random(`fw-${s}-a-${i}`) * 0.2;
        const v = 0.55 + random(`fw-${s}-v-${i}`) * 0.45;
        dx = Math.cos(a) * v;
        dy = Math.sin(a) * v;
      }
      const spread = (time: number) => 1 - Math.exp(-time / 9);
      const fall = (time: number) => 0.06 * time * time;
      const px = (time: number) => show.x + dx * radius * spread(time);
      const py = (time: number) =>
        show.y + dy * radius * spread(time) + fall(time);
      const life = Math.max(0, 1 - t / (48 + random(`fw-${s}-l-${i}`) * 20));
      const twinkle = t > 30 ? 0.5 + 0.5 * Math.sin(t * 1.7 + i) : 1;
      const alpha = life ** 1.4 * twinkle;
      if (alpha <= 0.01) {
        continue;
      }
      const back = Math.max(0, t - 4);
      ctx.strokeStyle = `rgb(${show.rgb} / ${alpha * 0.55})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px(back), py(back));
      ctx.lineTo(px(t), py(t));
      ctx.stroke();
      glowDot(ctx, px(t), py(t), 2.6, show.rgb, alpha);
    }
  });
  ctx.globalCompositeOperation = "source-over";
};

// Embers rising on warm air, flickering, from `start` on.
export const drawEmbers = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  {
    count,
    seed,
    start = 0,
    width = 1080,
    height = 1350,
    rgb = "255 170 80",
    strength = 1,
  }: {
    count: number;
    seed: string;
    start?: number;
    width?: number;
    height?: number;
    rgb?: string;
    strength?: number;
  },
) => {
  const local = frame - start;
  if (local < 0 || strength <= 0) {
    return;
  }
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i++) {
    const speed = 3 + random(`${seed}-v-${i}`) * 7;
    const span = height + 200;
    const offset = random(`${seed}-o-${i}`) * span;
    const y = height + 100 - ((local * speed + offset) % span);
    const x =
      random(`${seed}-x-${i}`) * width +
      Math.sin(local * 0.05 + i) * 24 +
      Math.sin(local * 0.13 + i * 2) * 10;
    const r = 1.4 + random(`${seed}-r-${i}`) * 2.6;
    const flicker =
      0.55 +
      0.45 * Math.sin(local * (0.3 + random(`${seed}-f-${i}`) * 0.5) + i);
    const fadeIn = Math.min(1, local / 10);
    glowDot(ctx, x, y, r, rgb, flicker * fadeIn * strength);
  }
  ctx.globalCompositeOperation = "source-over";
};
