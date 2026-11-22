import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import fire from "../audio/fire.mp3";
import shutter from "../audio/shutter.wav";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { one, useAnimeTimeline } from "../lib/anime";
import { Confetti } from "../lib/Confetti";
import { content } from "../lib/content";
import { SANS, SERIF } from "../lib/fonts";
import { photo } from "../lib/photos";
import { BAR, BEAT, ms } from "../timeline";
import { FIRE_ROAR } from "./Fire";

const film = content.film;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames: one bar.
const SHINE = 52; // the gold catches the light on the word about honour
const FLASHES = [BEAT, BEAT + 4, 3 * BEAT, 3 * BEAT + 5];
const WARM = 100;

const FRAME = { x: 540, y: 600, w: 640, h: 820 };
const GOLD =
  "linear-gradient(135deg, #7A5A22 0%, #F3D58A 18%, #A57C34 36%, #F8E3A1 52%, #8A6A2F 70%, #E9C873 86%, #6E4F1C 100%)";

const POPS = FLASHES.map((at, i) => ({
  at,
  x: i % 2 ? 860 + random(`pop-x-${i}`) * 160 : 60 + random(`pop-x-${i}`) * 160,
  y: 980 + random(`pop-y-${i}`) * 300,
}));

// Bar 16, the last bar of the pre-chorus: the portrait of the year. The
// curtains open on a gold frame in a spotlight, cameras flash on the
// backbeat, and the gold shines on the word.
export const Honor: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      one(el, ".curtain-left"),
      { x: [0, -640], duration: 620, ease: "outCubic" },
      0,
    );
    tl.add(
      one(el, ".curtain-right"),
      { x: [0, 640], duration: 620, ease: "outCubic" },
      0,
    );
    tl.add(
      one(el, ".portrait"),
      {
        opacity: [0, 1],
        scale: [0.82, 1],
        y: [40, 0],
        duration: 700,
        ease: "outExpo",
      },
      ms(4),
    );
    tl.add(
      one(el, ".placard"),
      { opacity: [0, 1], y: [60, 0], duration: 500, ease: "outBack(1.6)" },
      ms(SHINE - 4),
    );
    tl.add(
      one(el, ".portrait"),
      {
        scale: [
          { to: 1.04, duration: 110, ease: "outQuad" },
          { to: 1, duration: 500, ease: "outElastic(1, .5)" },
        ],
      },
      ms(SHINE),
    );
  });

  const shine = interpolate(frame, [SHINE - 2, SHINE + 18], [-0.4, 1.4], clamp);
  const flash = Math.max(
    0,
    ...FLASHES.map((at) =>
      frame >= at ? interpolate(frame - at, [0, 6], [0.45, 0], clamp) : 0,
    ),
  );
  const spot = interpolate(frame, [6, 24], [0, 1], clamp);
  const warm = interpolate(frame, [WARM, BAR], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0E0508", overflow: "hidden" }}>
      <Audio src={whoosh} from={0} volume={0.4} />
      {FLASHES.map((at) => (
        <Audio key={at} src={shutter} from={at} volume={0.55} />
      ))}
      <Audio src={sparkle} from={SHINE} volume={0.4} />
      {/* The fire roars on the next scene's first frame, the chorus's last bar. */}
      <Audio src={fire} from={BAR - FIRE_ROAR} volume={0.7} />

      {/* The stage: a dark velvet back wall and a floor. */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(90deg, #22070F 0px, #3A0D1B 50px, #4A1222 75px, #3A0D1B 100px, #22070F 150px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1120,
          bottom: 0,
          background: "linear-gradient(180deg, #2A140C 0%, #120804 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 55% at 50% 42%, transparent 30%, rgb(5 2 3 / 0.85) 100%)",
        }}
      />

      {/* The spotlight. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -60,
          width: 1080,
          height: 1300,
          clipPath: "polygon(43% 0, 57% 0, 92% 100%, 8% 100%)",
          background:
            "linear-gradient(180deg, rgb(255 238 200 / 0.5) 0%, rgb(255 230 180 / 0.12) 70%, transparent 100%)",
          opacity: spot,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 460,
          top: 1080,
          width: 920,
          height: 170,
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgb(255 236 196 / 0.45), transparent)",
          opacity: spot,
        }}
      />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        {/* The frame, its mat and the photo. */}
        <div
          className="portrait"
          style={{
            position: "absolute",
            left: FRAME.x - FRAME.w / 2,
            top: FRAME.y - FRAME.h / 2,
            width: FRAME.w,
            height: FRAME.h,
            opacity: 0,
            transform: "translateY(40px) scale(0.82)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: 34,
              boxSizing: "border-box",
              background: GOLD,
              boxShadow:
                "0 40px 90px rgb(0 0 0 / 0.7), inset 0 0 0 4px rgb(255 240 200 / 0.5), inset 0 0 0 10px rgb(90 60 20 / 0.5)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                padding: 22,
                boxSizing: "border-box",
                backgroundColor: "#F3E9D6",
                boxShadow:
                  "inset 0 0 0 3px rgb(120 90 40 / 0.6), inset 0 6px 16px rgb(0 0 0 / 0.35)",
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
                  src={photo(406)}
                  style={{
                    scale: 1.45,
                    transformOrigin: "62% 52%",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                  }}
                />
                <AbsoluteFill
                  style={{
                    background:
                      "radial-gradient(80% 60% at 50% 30%, transparent 50%, rgb(20 8 4 / 0.35) 100%)",
                  }}
                />
              </div>
            </div>
            {/* The gold shine that sweeps across on the word. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(115deg, transparent ${shine * 100 - 18}%, rgb(255 248 220 / 0.75) ${shine * 100}%, transparent ${shine * 100 + 18}%)`,
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>

        {/* The brass placard under it. */}
        <div
          className="placard"
          style={{
            position: "absolute",
            left: 540 - 270,
            top: FRAME.y + FRAME.h / 2 + 44,
            width: 540,
            height: 128,
            opacity: 0,
            transform: "translateY(60px)",
            background: GOLD,
            borderRadius: 6,
            boxShadow:
              "0 12px 30px rgb(0 0 0 / 0.6), inset 0 0 0 2px rgb(255 240 200 / 0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#3A2508",
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 54, lineHeight: 1 }}>
            {film.portrait[0]}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 24,
              fontWeight: 600,
              marginTop: 8,
              letterSpacing: 1,
            }}
          >
            {film.portrait[1]}
          </div>
        </div>

        {/* The curtains, closed at the start. */}
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            className={`curtain-${side}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              [side]: 0,
              width: 560,
              background:
                "repeating-linear-gradient(90deg, #5E0B1E 0px, #8E1A33 40px, #B02A45 62px, #8E1A33 84px, #5E0B1E 120px)",
              boxShadow:
                side === "left"
                  ? "20px 0 40px rgb(0 0 0 / 0.5)"
                  : "-20px 0 40px rgb(0 0 0 / 0.5)",
            }}
          />
        ))}
      </div>

      {frame >= SHINE ? (
        <Confetti
          count={60}
          colors={["#F3D58A", "#E9C873", "#FFF4D6", "#C99A3B"]}
          seed="honor-gold"
          start={SHINE}
        />
      ) : null}

      {/* Camera flashes from the crowd. */}
      {POPS.map((pop, i) => {
        const t = frame - pop.at;
        if (t < 0 || t > 8) {
          return null;
        }
        const o = interpolate(t, [0, 8], [1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pop.x - 160,
              top: pop.y - 160,
              width: 320,
              height: 320,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0.3) 30%, transparent)",
              opacity: o,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash }} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(90% 70% at 50% 100%, rgb(255 150 40 / 0.95), rgb(255 90 20 / 0.6) 50%, transparent 85%)",
          opacity: warm,
        }}
      />
    </AbsoluteFill>
  );
};
