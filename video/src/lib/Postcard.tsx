import React from "react";
import { Img } from "remotion";
import { content } from "./content";
import { HAND, SANS, SERIF } from "./fonts";
import { photo } from "./photos";

// The postcard that opens and closes the film. Everything is laid out for a
// card 720 px wide and scaled to the width it is drawn at.
export const CARD_W = 720;
export const CARD_H = 960;
export const PAPER = "#F6EBDD";
export const INK = "#3A1D45";
export const POSTMARK = "#9C2B88";
const FRONT_PHOTO = 755;
const STAMP_PHOTO = 140;
const text = content.film.postcard;

const Scaled: React.FC<{
  readonly width: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ width, children, style }) => (
  <div
    style={{
      position: "relative",
      width,
      height: (width * CARD_H) / CARD_W,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CARD_W,
        height: CARD_H,
        transformOrigin: "0 0",
        transform: `scale(${width / CARD_W})`,
      }}
    >
      {children}
    </div>
  </div>
);

// The picture side: her photo in a paper border, "Greetings from 2026".
export const PostcardFront: React.FC<{
  readonly width?: number;
  readonly style?: React.CSSProperties;
}> = ({ width = CARD_W, style }) => (
  <Scaled width={width} style={{ backgroundColor: PAPER, ...style }}>
    <div
      style={{
        position: "absolute",
        inset: 26,
        overflow: "hidden",
        backgroundColor: "#2A1834",
      }}
    >
      <Img
        src={photo(FRONT_PHOTO)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgb(36 12 40 / 0.78) 0%, rgb(36 12 40 / 0.15) 38%, transparent 55%)",
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: 60,
        bottom: 214,
        fontFamily: HAND,
        fontSize: 40,
        color: PAPER,
        textShadow: "0 2px 12px rgb(0 0 0 / 0.45)",
      }}
    >
      {text.greeting.replace(/\s*\d+$/, "")}
    </div>
    <div
      style={{
        position: "absolute",
        left: 46,
        bottom: 34,
        fontFamily: SERIF,
        fontSize: 230,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        color: PAPER,
        textShadow: "0 6px 30px rgb(0 0 0 / 0.4)",
      }}
    >
      {text.greeting.match(/\d+$/)?.[0]}
    </div>
  </Scaled>
);

// A perforated stamp with her photo in it.
export const Stamp: React.FC<{ readonly style?: React.CSSProperties }> = ({
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: 168,
      height: 206,
      padding: 12,
      backgroundColor: "#FFFDF8",
      // Perforated edges: a grid of holes centred on the edges, filled in
      // again everywhere inside the border, leaves half circles all round.
      WebkitMask:
        "radial-gradient(circle at 7px 7px, transparent 5px, #000 5.5px) -7px -7px / 14px 14px, linear-gradient(#000, #000) content-box",
      WebkitMaskComposite: "source-over",
      filter: "drop-shadow(0 2px 3px rgb(58 29 69 / 0.25))",
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
        src={photo(STAMP_PHOTO)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 25%",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 6,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 26,
          color: "#FFFDF8",
          textShadow: "0 1px 4px rgb(0 0 0 / 0.5)",
        }}
      >
        22
      </div>
    </div>
  </div>
);

// A round postmark with wavy cancellation lines.
export const Postmark: React.FC<{
  readonly style?: React.CSSProperties;
  readonly className?: string;
}> = ({ style, className }) => (
  <svg
    className={className}
    width={340}
    height={190}
    viewBox="0 0 340 190"
    style={{ position: "absolute", overflow: "visible", ...style }}
  >
    <g fill="none" stroke={POSTMARK} strokeWidth={4} opacity={0.82}>
      <circle cx={95} cy={95} r={82} />
      <circle cx={95} cy={95} r={66} strokeWidth={2} />
      {[60, 84, 108, 132].map((y) => (
        <path key={y} d={`M185 ${y} q 18 -14 36 0 t 36 0 t 36 0 t 36 0`} />
      ))}
    </g>
    <defs>
      <path id="postmark-arc" d="M 33 95 a 62 62 0 1 1 124 0" />
    </defs>
    <text
      fill={POSTMARK}
      opacity={0.85}
      fontFamily={SANS}
      fontWeight={700}
      fontSize={19}
      letterSpacing={3}
    >
      <textPath href="#postmark-arc" startOffset="50%" textAnchor="middle">
        MIDNIGHT POST
      </textPath>
    </text>
    <text
      x={95}
      y={104}
      fill={POSTMARK}
      opacity={0.85}
      fontFamily={SANS}
      fontWeight={800}
      fontSize={24}
      textAnchor="middle"
    >
      {text.postmark}
    </text>
    <text
      x={95}
      y={136}
      fill={POSTMARK}
      opacity={0.85}
      fontFamily={SANS}
      fontWeight={700}
      fontSize={18}
      textAnchor="middle"
    >
      12:00 AM
    </text>
  </svg>
);

// A line of handwriting, revealed from left to right as `progress` goes 0 to 1.
export const Handwriting: React.FC<{
  readonly text: string;
  readonly progress: number;
  readonly size: number;
  readonly style?: React.CSSProperties;
}> = ({ text: line, progress, size, style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily: HAND,
      fontSize: size,
      lineHeight: 1.2,
      color: INK,
      whiteSpace: "nowrap",
      clipPath: `inset(-20% ${(1 - progress) * 100}% -20% 0)`,
      ...style,
    }}
  >
    {line}
  </div>
);

// The writing side: a message on top, the address below, stamp and postmark
// in the corner. Children are drawn on top (the postmark and the stamps that
// land on the card during the film).
export const PostcardBack: React.FC<{
  readonly width?: number;
  readonly message: number;
  readonly address: number;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ width = CARD_W, message, address, children, style }) => (
  <Scaled
    width={width}
    style={{
      backgroundColor: PAPER,
      // A faint paper grain.
      backgroundImage:
        "repeating-linear-gradient(0deg, rgb(58 29 69 / 0.025) 0 2px, transparent 2px 5px), repeating-linear-gradient(90deg, rgb(58 29 69 / 0.02) 0 1px, transparent 1px 7px)",
      ...style,
    }}
  >
    <Stamp style={{ right: 48, top: 48 }} />
    {text.message.map((line, i) => (
      <Handwriting
        key={line}
        text={line}
        size={58}
        progress={Math.min(1, Math.max(0, message * text.message.length - i))}
        style={{ left: 60, top: 300 + i * 96 }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 560,
        height: 0,
        borderTop: `2px solid rgb(58 29 69 / 0.25)`,
      }}
    />
    {[700, 790, 880].map((top) => (
      <div
        key={top}
        style={{
          position: "absolute",
          left: 300,
          right: 60,
          top,
          borderTop: `2px solid rgb(58 29 69 / 0.3)`,
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 620,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: 4,
        color: "rgb(58 29 69 / 0.55)",
      }}
    >
      TO
    </div>
    <Handwriting
      text={text.to[0]}
      size={60}
      progress={Math.min(1, Math.max(0, address * 2))}
      style={{ left: 316, top: 610 }}
    />
    <Handwriting
      text={text.to[1]}
      size={30}
      progress={Math.min(1, Math.max(0, address * 2 - 1))}
      style={{ left: 316, top: 732 }}
    />
    {children}
  </Scaled>
);
