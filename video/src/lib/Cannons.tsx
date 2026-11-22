import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  readonly start: number;
  readonly colors: string[];
  readonly count: number;
  readonly seed: string;
};

const GRAVITY = 0.85;

// Two party cannons in the bottom corners. Every piece is fired at `start` and
// then stepped frame by frame: fast and straight on the way up, then caught by
// the air so it flutters down slowly. random(seed) keeps each render the same.
export const ConfettiCannons: React.FC<Props> = ({
  start,
  colors,
  count,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < start) {
    return null;
  }

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (key: string) => random(`${seed}-${key}-${i}`);
        const left = i % 2 === 0;
        const steps = Math.floor(frame - start - r("delay") * 4);
        if (steps < 0) {
          return null;
        }
        const degrees = -50 - r("angle") * 32;
        const angle = ((left ? degrees : -180 - degrees) * Math.PI) / 180;
        const speed = 58 + r("speed") * 42;
        let x = left ? 20 : width - 20;
        let y = height + 20;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        for (let s = 0; s < steps; s++) {
          x += vx;
          y += vy;
          vx *= 0.94;
          vy = vy > 0 ? vy * 0.85 + GRAVITY * 0.6 : vy * 0.95 + GRAVITY;
        }
        const falling = Math.min(1, Math.max(0, (steps - 28) / 20));
        const sway = Math.sin(steps * 0.11 + r("phase") * 6.3) * 34 * falling;
        const round = r("shape") < 0.25;
        const w = round ? 18 : 12 + r("w") * 10;
        const h = round ? 18 : 22 + r("h") * 16;
        const spin = (r("spin") - 0.5) * 24;
        const flip = 0.1 + r("flip") * 0.16;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + sway - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              borderRadius: round ? "50%" : 2,
              backgroundColor: colors[i % colors.length],
              rotate: `${steps * spin + r("phase") * 180}deg`,
              scale: `1 ${Math.cos(steps * flip + r("phase") * 6).toFixed(3)}`,
            }}
          />
        );
      })}
    </>
  );
};
