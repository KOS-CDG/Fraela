import type { Timeline } from "animejs";
import React from "react";
import { random } from "remotion";
import { all, data } from "./anime";

export const STAR =
  "M0 -10C1 -2 2 -1 10 0C2 1 1 2 0 10C-1 2 -2 1 -10 0C-2 -1 -1 -2 0 -10Z";

type Props = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly count: number;
  readonly colors: string[];
  readonly spread?: number;
};

// Dots and stars waiting on one point until addBurst throws them outwards.
// Their directions come from random(id), so every render matches.
export const Burst: React.FC<Props> = ({
  id,
  x,
  y,
  count,
  colors,
  spread = 420,
}) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const angle =
        (i / count) * Math.PI * 2 + (random(`${id}-angle-${i}`) - 0.5) * 0.6;
      const distance = spread * (0.45 + random(`${id}-distance-${i}`) * 0.55);
      const size = 16 + random(`${id}-size-${i}`) * 26;
      const color = colors[i % colors.length];
      return (
        <div
          key={i}
          data-burst={id}
          data-dx={(Math.cos(angle) * distance).toFixed(1)}
          data-dy={(Math.sin(angle) * distance).toFixed(1)}
          data-spin={((random(`${id}-spin-${i}`) - 0.5) * 540).toFixed(0)}
          style={{
            position: "absolute",
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            transform: "scale(0)",
          }}
        >
          {i % 3 === 0 ? (
            <svg viewBox="-10 -10 20 20" width={size} height={size}>
              <path d={STAR} fill={color} />
            </svg>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: i % 3 === 1 ? "50%" : 3,
                backgroundColor: color,
              }}
            />
          )}
        </div>
      );
    })}
  </>
);

export const addBurst = (
  tl: Timeline,
  root: Element,
  id: string,
  at: number,
) => {
  tl.add(
    all(root, `[data-burst="${id}"]`),
    {
      x: data("dx"),
      y: data("dy"),
      rotate: data("spin"),
      scale: [
        { from: 0, to: 1.25, duration: 110, ease: "outQuad" },
        { to: 0, duration: 790, ease: "inQuad" },
      ],
      duration: 900,
      ease: "outExpo",
    },
    at,
  );
};
