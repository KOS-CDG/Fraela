import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  readonly count: number;
  readonly color: string;
  readonly seed: string;
  readonly start?: number;
};

// Four-point stars that twinkle and drift upward. Positions come from
// random(seed), so every render of a frame is identical.
export const Sparkles: React.FC<Props> = ({
  count,
  color,
  seed,
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const local = Math.max(0, frame - start);

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const size = 12 + random(`${seed}-size-${i}`) * 26;
        const x = random(`${seed}-x-${i}`) * width;
        const rise = 0.25 + random(`${seed}-rise-${i}`) * 0.6;
        const y = random(`${seed}-y-${i}`) * height - local * rise;
        const phase = random(`${seed}-phase-${i}`) * Math.PI * 2;
        const speed = 0.06 + random(`${seed}-speed-${i}`) * 0.08;
        const twinkle = Math.max(0, Math.sin(local * speed + phase)) ** 3;
        const fadeIn = Math.min(1, local / 18);

        return (
          <svg
            key={i}
            viewBox="-10 -10 20 20"
            width={size}
            height={size}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              opacity: twinkle * fadeIn,
              rotate: `${local * 0.8 + phase * 20}deg`,
            }}
          >
            <path
              d="M0 -10C1 -2 2 -1 10 0C2 1 1 2 0 10C-1 2 -2 1 -10 0C-2 -1 -1 -2 0 -10Z"
              fill={color}
            />
          </svg>
        );
      })}
    </>
  );
};
