import { makeHeart } from "@remotion/shapes";
import React from "react";
import { random } from "remotion";

const UNIT = makeHeart({ height: 20 });
// A heart path 22 wide and 20 tall with its top-left corner at 0 0.
export const HEART_PATH = UNIT.path;
export const HEART_W = UNIT.width;
export const HEART_H = UNIT.height;

export const Heart: React.FC<{
  readonly size: number;
  readonly color: string;
  readonly style?: React.CSSProperties;
  readonly className?: string;
  readonly stroke?: number;
}> = ({ size, color, style, className, stroke }) => (
  <svg
    className={className}
    width={size}
    height={(size * HEART_H) / HEART_W}
    viewBox={`-2 -2 ${HEART_W + 4} ${HEART_H + 4}`}
    style={{ overflow: "visible", ...style }}
  >
    <path
      d={HEART_PATH}
      fill={stroke ? "none" : color}
      stroke={stroke ? color : "none"}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </svg>
);

// Hearts that rise from below the frame, swaying, from `start` on. Every value
// comes from random(seed), so each frame always renders the same way.
export const RisingHearts: React.FC<{
  readonly frame: number;
  readonly count: number;
  readonly seed: string;
  readonly colors: readonly string[];
  readonly start?: number;
  readonly width?: number;
  readonly height?: number;
  readonly sizes?: readonly [number, number];
}> = ({
  frame,
  count,
  seed,
  colors,
  start = 0,
  width = 1080,
  height = 1350,
  sizes = [22, 70],
}) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const delay = random(`${seed}-delay-${i}`) * 50;
      const t = frame - start - delay;
      if (t < 0) {
        return null;
      }
      const size =
        sizes[0] + random(`${seed}-size-${i}`) * (sizes[1] - sizes[0]);
      const speed = 4 + random(`${seed}-speed-${i}`) * 6;
      const y = height + size - t * speed;
      if (y < -size * 2) {
        return null;
      }
      const sway = Math.sin(t * 0.07 + random(`${seed}-phase-${i}`) * 6) * 30;
      const x = random(`${seed}-x-${i}`) * width + sway;
      return (
        <Heart
          key={i}
          size={size}
          color={colors[i % colors.length]}
          style={{
            position: "absolute",
            left: x - size / 2,
            top: y,
            opacity:
              Math.min(1, t / 8) * (0.55 + random(`${seed}-o-${i}`) * 0.45),
            rotate: `${sway * 0.5}deg`,
            scale: Math.min(1, t / 6),
          }}
        />
      );
    })}
  </>
);
