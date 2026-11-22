import React from "react";
import { random } from "remotion";

// A field of small stars that twinkle. Positions come from random(seed).
export const Stars: React.FC<{
  readonly frame: number;
  readonly count: number;
  readonly seed: string;
  readonly width?: number;
  readonly height?: number;
  readonly color?: string;
  readonly style?: React.CSSProperties;
}> = ({
  frame,
  count,
  seed,
  width = 1080,
  height = 1350,
  color = "#FFF4E0",
  style,
}) => (
  <div style={{ position: "absolute", inset: 0, ...style }}>
    {Array.from({ length: count }, (_, i) => {
      const size = 1.5 + random(`${seed}-s-${i}`) ** 3 * 4.5;
      const phase = random(`${seed}-p-${i}`) * Math.PI * 2;
      const speed = 0.05 + random(`${seed}-v-${i}`) * 0.12;
      const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * speed + phase));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`${seed}-x-${i}`) * width,
            top: random(`${seed}-y-${i}`) * height,
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: glow,
            boxShadow: size > 4 ? `0 0 ${size * 2}px ${color}` : undefined,
          }}
        />
      );
    })}
  </div>
);

const CRATERS = [
  { x: 0.3, y: 0.32, r: 0.13 },
  { x: 0.62, y: 0.24, r: 0.08 },
  { x: 0.7, y: 0.56, r: 0.15 },
  { x: 0.38, y: 0.7, r: 0.1 },
  { x: 0.18, y: 0.55, r: 0.06 },
  { x: 0.52, y: 0.46, r: 0.05 },
];

// A full moon with soft craters and a halo. Children are drawn inside the
// disc, under the craters, for a face in the moon.
export const Moon: React.FC<{
  readonly size: number;
  readonly halo?: number;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}> = ({ size, halo = 1, children, style, className }) => (
  <div
    className={className}
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: -size * 0.9,
        borderRadius: "50%",
        background:
          "radial-gradient(closest-side, rgb(255 236 214 / 0.5), rgb(242 141 178 / 0.16) 55%, transparent)",
        opacity: halo,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 38% 34%, #FFFBF1 0%, #F7EBD6 42%, #E2CFB2 78%, #C9B396 100%)",
        boxShadow: `0 0 ${size * 0.25}px rgb(255 238 214 / 0.55)`,
      }}
    >
      {children}
      {CRATERS.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (c.x - c.r) * size,
            top: (c.y - c.r) * size,
            width: c.r * 2 * size,
            height: c.r * 2 * size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 60% 60%, rgb(150 120 95 / 0.22), rgb(150 120 95 / 0.08) 60%, transparent 72%)",
            mixBlendMode: "multiply",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: `inset ${-size * 0.06}px ${-size * 0.05}px ${size * 0.14}px rgb(120 80 70 / 0.35)`,
        }}
      />
    </div>
  </div>
);

// The moon at a phase from 0 (new) to 1 (full), as an SVG disc whose dark
// part shrinks from the left.
export const MoonPhase: React.FC<{
  readonly size: number;
  readonly phase: number;
  readonly lit?: string;
  readonly dark?: string;
}> = ({ size, phase, lit = "#F7EBD6", dark = "rgb(247 235 214 / 0.14)" }) => {
  const r = size / 2;
  // The terminator is an ellipse whose x radius runs from r to 0 and back.
  const k = Math.cos(phase * Math.PI) * r;
  const sweep = phase < 0.5 ? 0 : 1;
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`}>
      <circle r={r} fill={dark} />
      {phase > 0.001 ? (
        <path
          d={`M0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${Math.abs(k)} ${r} 0 0 ${sweep} 0 ${-r} Z`}
          fill={lit}
        />
      ) : null}
    </svg>
  );
};
