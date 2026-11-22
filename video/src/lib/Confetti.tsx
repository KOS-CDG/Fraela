import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  readonly count: number;
  readonly colors: string[];
  readonly seed: string;
  readonly start?: number;
};

// Paper confetti that falls, sways and tumbles. Every value comes from
// random(seed), so the same frame always renders the same way.
export const Confetti: React.FC<Props> = ({
  count,
  colors,
  seed,
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const delay = random(`${seed}-delay-${i}`) * 36;
        const local = frame - start - delay;
        if (local < 0) {
          return null;
        }
        const round = random(`${seed}-shape-${i}`) < 0.3;
        const w = round ? 16 : 12 + random(`${seed}-w-${i}`) * 10;
        const h = round ? 16 : 20 + random(`${seed}-h-${i}`) * 16;
        const fall = 5.5 + random(`${seed}-fall-${i}`) * 5;
        const sway = 18 + random(`${seed}-sway-${i}`) * 46;
        const phase = random(`${seed}-phase-${i}`) * Math.PI * 2;
        const spin = (random(`${seed}-spin-${i}`) - 0.5) * 16;
        const flip = 0.08 + random(`${seed}-flip-${i}`) * 0.14;
        const x =
          random(`${seed}-x-${i}`) * width +
          Math.sin(local * 0.05 + phase) * sway;
        const y = -60 - random(`${seed}-y-${i}`) * 120 + local * fall;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              borderRadius: round ? "50%" : 2,
              backgroundColor: colors[i % colors.length],
              rotate: `${local * spin + phase * 40}deg`,
              scale: `1 ${Math.cos(local * flip + phase).toFixed(3)}`,
            }}
          />
        );
      })}
    </>
  );
};
