import React from "react";
import { Img } from "remotion";
import { PAPER } from "./Postcard";
import { photo } from "./photos";

// A photo printed with a paper border: even all round for a postcard, deeper
// at the bottom for a polaroid. Children are drawn over the photo.
export const PhotoCard: React.FC<{
  readonly page: number;
  readonly width: number;
  readonly height: number;
  readonly border?: number;
  readonly bottom?: number;
  readonly position?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly children?: React.ReactNode;
}> = ({
  page,
  width,
  height,
  border = 14,
  bottom = border,
  position = "center 35%",
  className,
  style,
  children,
}) => (
  <div
    className={className}
    style={{
      position: "absolute",
      width,
      height,
      padding: `${border}px ${border}px ${bottom}px`,
      boxSizing: "border-box",
      backgroundColor: PAPER,
      boxShadow: "0 24px 60px rgb(0 0 0 / 0.45)",
      ...style,
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Img
        src={photo(page)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          display: "block",
        }}
      />
      {children}
    </div>
  </div>
);
