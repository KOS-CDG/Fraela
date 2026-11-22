import React from "react";

type Props = {
  readonly color: string;
  readonly size: number;
  readonly rays?: number;
  readonly style?: React.CSSProperties;
};

// A disc of alternating rays, drawn with one conic gradient.
export const Sunburst: React.FC<Props> = ({
  color,
  size,
  rays = 18,
  style,
}) => {
  const half = 360 / rays / 2;
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: -size / 2,
        top: -size / 2,
        borderRadius: "50%",
        background: `repeating-conic-gradient(${color} 0deg ${half}deg, transparent ${half}deg ${half * 2}deg)`,
        ...style,
      }}
    />
  );
};
