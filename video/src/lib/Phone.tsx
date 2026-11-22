import React from "react";
import { Easing, interpolate } from "remotion";
import { SANS } from "./fonts";

// The phone's body and screen, in film pixels.
export const PHONE = { left: 230, top: 45, width: 620, height: 1260 };
const BEZEL = 16;
export const SCREEN = {
  left: PHONE.left + BEZEL,
  top: PHONE.top + BEZEL,
  width: PHONE.width - 2 * BEZEL,
  height: PHONE.height - 2 * BEZEL,
  radius: 70,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A phone seen from the front: a dark body with a soft rim and a pill-shaped
// camera cut-out. Children fill the screen, clipped to its rounded corners.
export const Phone: React.FC<{
  readonly children: React.ReactNode;
  readonly bodyOpacity?: number;
}> = ({ children, bodyOpacity = 1 }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: PHONE.left,
        top: PHONE.top,
        width: PHONE.width,
        height: PHONE.height,
        borderRadius: SCREEN.radius + BEZEL,
        background:
          "linear-gradient(150deg, #3A2C40 0%, #17101B 45%, #0C080E 100%)",
        boxShadow:
          "0 50px 140px rgb(0 0 0 / 0.65), inset 0 0 0 2px rgb(255 255 255 / 0.10), inset 0 0 0 7px rgb(0 0 0 / 0.5)",
        opacity: bodyOpacity,
      }}
    >
      {[220, 330].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: -5,
            top,
            width: 5,
            height: 80,
            borderRadius: 3,
            backgroundColor: "#2A2030",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          right: -5,
          top: 280,
          width: 5,
          height: 130,
          borderRadius: 3,
          backgroundColor: "#2A2030",
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: SCREEN.left,
        top: SCREEN.top,
        width: SCREEN.width,
        height: SCREEN.height,
        borderRadius: SCREEN.radius,
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: SCREEN.width / 2 - 78,
          top: 22,
          width: 156,
          height: 46,
          borderRadius: 23,
          backgroundColor: "#000",
          opacity: bodyOpacity,
        }}
      />
    </div>
  </>
);

// Signal, wi-fi and battery, top right of the screen.
export const StatusIcons: React.FC = () => (
  <svg
    width={150}
    height={30}
    viewBox="0 0 150 30"
    style={{ position: "absolute", right: 46, top: 30 }}
  >
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={i * 10}
        y={20 - i * 5}
        width={7}
        height={8 + i * 5}
        rx={2}
        fill="#fff"
      />
    ))}
    <path
      d="M52 14a20 20 0 0 1 28 0l-3 3a16 16 0 0 0-22 0zM58 20a11 11 0 0 1 16 0l-8 8z"
      fill="#fff"
    />
    <rect
      x={92}
      y={7}
      width={44}
      height={20}
      rx={6}
      fill="none"
      stroke="#fff"
      strokeOpacity={0.5}
      strokeWidth={2}
    />
    <rect x={96} y={11} width={32} height={12} rx={3} fill="#fff" />
    <rect
      x={139}
      y={13}
      width={3}
      height={8}
      rx={1.5}
      fill="#fff"
      fillOpacity={0.5}
    />
  </svg>
);

// A postage stamp with a heart: the icon of the postcard app.
export const AppIcon: React.FC<{ readonly size?: number }> = ({
  size = 64,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      flexShrink: 0,
      background: "linear-gradient(160deg, #F28DB2 0%, #9C2B88 100%)",
      display: "grid",
      placeItems: "center",
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40">
      <rect
        x={5}
        y={5}
        width={30}
        height={30}
        rx={3}
        fill="none"
        stroke="#fff"
        strokeWidth={2.6}
        strokeDasharray="3.2 2.4"
      />
      <path
        d="M20 29s-8-4.8-8-10.2C12 15.9 14 14 16.4 14c1.6 0 2.8.9 3.6 2.1.8-1.2 2-2.1 3.6-2.1 2.4 0 4.4 1.9 4.4 4.8C28 24.2 20 29 20 29z"
        fill="#fff"
      />
    </svg>
  </div>
);

// A notification on the lock screen, on frosted glass.
export const Notification: React.FC<{
  readonly title: string;
  readonly body: string;
  readonly time: string;
}> = ({ title, body, time }) => (
  <div
    style={{
      display: "flex",
      gap: 20,
      alignItems: "center",
      padding: "22px 24px",
      borderRadius: 36,
      backgroundColor: "rgb(255 255 255 / 0.17)",
      backdropFilter: "blur(26px) saturate(1.3)",
      color: "#fff",
      fontFamily: SANS,
    }}
  >
    <AppIcon />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 27,
          fontWeight: 650,
        }}
      >
        <span>{title}</span>
        <span style={{ fontWeight: 400, opacity: 0.7, fontSize: 24 }}>
          {time}
        </span>
      </div>
      <div
        style={{ fontSize: 26, lineHeight: 1.3, marginTop: 4, opacity: 0.92 }}
      >
        {body}
      </div>
    </div>
  </div>
);

// The wallpaper: the night sky the rest of the film lives in.
export const Wallpaper: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(120% 70% at 50% 108%, #8C3A78 0%, #3B1640 38%, #160A22 70%, #0B0612 100%)",
    }}
  >
    {Array.from({ length: 34 }, (_, i) => {
      // A fixed scatter of small stars.
      const x = (i * 157) % SCREEN.width;
      const y = 60 + ((i * 263) % 700);
      const size = 2 + (i % 3);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "#FFF4E0",
            opacity: 0.25 + (i % 5) * 0.1,
          }}
        />
      );
    })}
  </div>
);

const CARD_W = 116;
const CARD_H = 172;

const Half: React.FC<{
  readonly digit: string;
  readonly half: "top" | "bottom";
  readonly style?: React.CSSProperties;
}> = ({ digit, half, style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: half === "top" ? 0 : CARD_H / 2,
      width: CARD_W,
      height: CARD_H / 2,
      overflow: "hidden",
      background:
        half === "top"
          ? "linear-gradient(#3A2346, #2A1934)"
          : "linear-gradient(#251530, #1C1025)",
      borderRadius: half === "top" ? "18px 18px 0 0" : "0 0 18px 18px",
      backfaceVisibility: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: half === "top" ? 0 : -CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        lineHeight: `${CARD_H}px`,
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: 330,
        fontSize: 150,
        color: "#FBEFF6",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {digit}
    </div>
  </div>
);

// One split-flap card. At progress 0 it shows `from`; the top flap falls
// over the first half of the flip and the new bottom flap lands over the second.
const FlipCard: React.FC<{
  readonly from: string;
  readonly to: string;
  readonly progress: number;
}> = ({ from, to, progress }) => {
  const fall = interpolate(progress, [0, 0.5], [0, -90], clamp);
  const land = interpolate(progress, [0.5, 1], [90, 0], clamp);
  return (
    <div
      style={{
        position: "relative",
        width: CARD_W,
        height: CARD_H,
        perspective: 700,
        filter: "drop-shadow(0 10px 18px rgb(0 0 0 / 0.45))",
      }}
    >
      <Half digit={progress > 0 ? to : from} half="top" />
      <Half digit={from} half="bottom" />
      {progress > 0 && progress < 0.5 ? (
        <Half
          digit={from}
          half="top"
          style={{
            transformOrigin: "50% 100%",
            transform: `rotateX(${fall}deg)`,
          }}
        />
      ) : null}
      {progress >= 0.5 ? (
        <Half
          digit={to}
          half="bottom"
          style={{
            transformOrigin: "50% 0%",
            transform: `rotateX(${land}deg)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CARD_H / 2 - 1.5,
          height: 3,
          backgroundColor: "rgb(0 0 0 / 0.55)",
        }}
      />
    </div>
  );
};

// A flip clock: each digit that changes flips over 8 frames from its own frame.
export const FlipClock: React.FC<{
  readonly from: string;
  readonly to: string;
  readonly flipAt: number;
  readonly frame: number;
}> = ({ from, to, flipAt, frame }) => {
  let changed = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {Array.from(from).map((char, i) => {
        if (char === ":") {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 34,
                padding: "0 4px",
              }}
            >
              {[0, 1].map((dot) => (
                <div
                  key={dot}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#FBEFF6",
                  }}
                />
              ))}
            </div>
          );
        }
        const next = to[i];
        const start = flipAt + (char === next ? 0 : changed++ * 3);
        const progress =
          char === next
            ? 0
            : interpolate(frame, [start, start + 8], [0, 1], {
                ...clamp,
                easing: Easing.in(Easing.quad),
              });
        return <FlipCard key={i} from={char} to={next} progress={progress} />;
      })}
    </div>
  );
};

// How many digits change between two clock readings, for timing the flip sounds.
export const changedDigits = (from: string, to: string) =>
  Array.from(from).filter((char, i) => char !== ":" && char !== to[i]).length;
