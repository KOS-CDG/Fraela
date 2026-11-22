import { Audio } from "@remotion/media";
import { stagger } from "animejs";
import React, { useCallback } from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import fireworkFar from "../audio/firework-far.mp3";
import firework from "../audio/firework.mp3";
import flip from "../audio/flip.wav";
import ding from "../audio/ding.wav";
import sparkler from "../audio/sparkler.mp3";
import tap from "../audio/tap.wav";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { CanvasLayer, drawFireworks, type Firework } from "../lib/Canvas";
import { content } from "../lib/content";
import { HAND, SANS, SERIF } from "../lib/fonts";
import {
  FlipClock,
  Notification,
  Phone,
  SCREEN,
  StatusIcons,
} from "../lib/Phone";
import { photo } from "../lib/photos";
import { Split } from "../lib/Split";
import { BAR, SCENES, songBar, ms } from "../timeline";

const film = content.film;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Film frames used by the music bed in Fraela2026.tsx.
export const INTO_PHONE = SCENES.finale.from + 2 * BAR;
export const SCREEN_OFF = songBar(57);

// Scene frames.
const WRITE = [14, 64] as const;
const SIGNOFF = BAR;
const PULL = INTO_PHONE - SCENES.finale.from;
const LOCK_UI = PULL + 22;
const MINUTE = PULL + 60;
const OPENED = PULL + 84;
const OFF = SCREEN_OFF - SCENES.finale.from;

// The camera starts so close that the phone's screen fills the frame's
// width, looking at the top of the screen, where the sky is.
const START_SCALE = 1080 / SCREEN.width;
const LOOK_AT = 60;
const START_Y = (247 - LOOK_AT) * START_SCALE;

const NEAR = { radius: 200, count: 80 };
const FAR = { radius: 110, count: 56 };
const GOLD = "255 214 120";
const PINK = "255 140 180";
const ROSE = "255 110 150";
const VIOLET = "205 160 255";
const PALE = "220 230 255";
// Fireworks over the city, in the screen's own pixels.
const SHOWS: (Firework & { near: boolean })[] = [
  { at: 0, x: 300, y: 200, rgb: GOLD, near: true, ...NEAR },
  { at: 30, x: 470, y: 140, rgb: PINK, near: false, ...FAR },
  { at: 45, x: 130, y: 120, rgb: PALE, near: false, ...FAR },
  { at: 60, x: 420, y: 230, rgb: ROSE, near: true, ...NEAR },
  { at: 90, x: 200, y: 160, rgb: GOLD, near: false, ...FAR },
  { at: 105, x: 500, y: 110, rgb: VIOLET, near: false, ...FAR },
  {
    at: SIGNOFF,
    x: 294,
    y: 215,
    rgb: PINK,
    near: true,
    heart: true,
    radius: 170,
    count: 90,
  },
  { at: 150, x: 110, y: 150, rgb: GOLD, near: false, ...FAR },
  { at: 165, x: 470, y: 190, rgb: "255 240 205", near: true, ...NEAR },
  { at: 195, x: 260, y: 120, rgb: PINK, near: false, ...FAR },
  { at: 210, x: 150, y: 230, rgb: VIOLET, near: true, ...NEAR },
  { at: 228, x: 450, y: 140, rgb: GOLD, near: false, ...FAR },
  { at: 262, x: 300, y: 150, rgb: ROSE, near: false, ...FAR },
  { at: 300, x: 140, y: 210, rgb: GOLD, near: false, ...FAR },
  { at: 334, x: 430, y: 170, rgb: PINK, near: true, ...NEAR },
  { at: 372, x: 240, y: 130, rgb: VIOLET, near: false, ...FAR },
  { at: 405, x: 480, y: 220, rgb: GOLD, near: false, ...FAR },
  { at: 440, x: 300, y: 160, rgb: ROSE, near: true, ...NEAR },
];

// The lock screen, as in the opening scene.
const CLOCK_TOP = 200;
const NOTE = { left: 26, top: 760, width: SCREEN.width - 52 };

// Bars 53 to 56, the outro: her birthday night. Fireworks over the city she
// stands in front of, the message written with a sparkler, a heart in the sky;
// then the camera pulls back out of the phone it all happened in, the clock
// turns 12:01, the postcard is opened, and the screen goes dark.
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      all(el, ".title-char"),
      {
        opacity: [0, 1],
        y: [40, 0],
        scale: [0.4, 1],
        duration: 520,
        ease: "outBack(2)",
        delay: stagger(28),
      },
      ms(2),
    );
    tl.add(
      one(el, ".signoff"),
      { opacity: [0, 1], y: [24, 0], duration: 600, ease: "outCubic" },
      ms(SIGNOFF + 4),
    );
    tl.add(
      one(el, ".title"),
      { opacity: [1, 0], y: [0, -40], duration: ms(18), ease: "inQuad" },
      ms(PULL),
    );
    tl.add(
      one(el, ".camera"),
      {
        y: [START_Y, 0],
        scale: [START_SCALE, 1],
        duration: ms(58),
        ease: "inOutCubic",
      },
      ms(PULL),
    );
    tl.add(
      one(el, ".lock-ui"),
      { opacity: [0, 1], duration: ms(24), ease: "outQuad" },
      ms(LOCK_UI),
    );
    tl.add(
      one(el, ".note"),
      {
        opacity: [0, 1],
        y: [-70, 0],
        scale: [0.9, 1],
        duration: 650,
        ease: "outBack(1.6)",
      },
      ms(OPENED),
    );
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, f: number) =>
      drawFireworks(ctx, f, SHOWS, 620),
    [],
  );
  const write = interpolate(frame, WRITE, [0, 1], clamp);
  const drift = interpolate(frame, [0, PULL], [1, 1.06], clamp);
  const dim = interpolate(frame, [LOCK_UI, LOCK_UI + 24], [0, 0.3], clamp);
  const screenOn = interpolate(frame, [OFF, OFF + 3], [1, 0], clamp);
  const dark = interpolate(frame, [OFF + 8, OFF + 52], [0, 1], clamp);
  const glow = interpolate(
    frame,
    [PULL, PULL + 50, OFF, OFF + 10],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#07040B", overflow: "hidden" }}>
      {SHOWS.map((show) => (
        <Audio
          key={show.at}
          src={show.near ? firework : fireworkFar}
          from={show.at}
          volume={(show.near ? 0.5 : 0.32) * (show.at >= PULL ? 0.35 : 1)}
        />
      ))}
      <Audio src={sparkler} from={WRITE[0]} volume={0.35} />
      <Audio src={flip} from={MINUTE} volume={0.5} />
      <Audio src={ding} from={OPENED} volume={0.35} />
      <Audio src={tap} from={OFF} volume={0.9} />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 45% at 50% 52%, rgb(140 58 120 / 0.35), transparent 70%)",
          opacity: glow,
        }}
      />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        <div
          className="camera"
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "540px 675px",
            transform: `translateY(${START_Y}px) scale(${START_SCALE})`,
          }}
        >
          <Phone>
            <div style={{ position: "absolute", inset: 0, opacity: screenOn }}>
              {/* The wallpaper: her, the city and the fireworks. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  scale: drift,
                  transformOrigin: "50% 40%",
                }}
              >
                <Img
                  src={photo(943)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "28% 80%",
                  }}
                />
                <AbsoluteFill
                  style={{
                    background:
                      "linear-gradient(180deg, rgb(8 4 16 / 0.55) 0%, rgb(8 4 16 / 0.1) 32%, transparent 50%, rgb(8 4 16 / 0.35) 100%)",
                  }}
                />
                <CanvasLayer
                  draw={draw}
                  width={SCREEN.width}
                  height={SCREEN.height}
                  density={2}
                />
              </div>
              <AbsoluteFill style={{ backgroundColor: "#000", opacity: dim }} />

              {/* The message, written in the sky. */}
              <div
                className="title"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 128,
                  textAlign: "center",
                  color: "#FFF6EC",
                  textShadow: "0 4px 24px rgb(0 0 0 / 0.6)",
                }}
              >
                <div
                  style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.05 }}
                >
                  <Split text={film.finale[0]} className="title-char" />
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: HAND,
                      fontSize: 46,
                      lineHeight: 1.5,
                      whiteSpace: "nowrap",
                      clipPath: `inset(-30% ${(1 - write) * 100}% -30% 0)`,
                    }}
                  >
                    {film.finale[1]}
                  </div>
                  {write > 0 && write < 1 ? (
                    <div
                      style={{
                        position: "absolute",
                        left: `${write * 100}%`,
                        top: "55%",
                        width: 60,
                        height: 60,
                        translate: "-50% -50%",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(closest-side, #FFFFFF 0%, rgb(255 230 170 / 0.9) 25%, rgb(255 170 80 / 0.4) 55%, transparent)",
                        scale: 0.8 + 0.4 * Math.abs(Math.sin(frame * 1.7)),
                      }}
                    />
                  ) : null}
                </div>
                <div
                  className="signoff"
                  style={{
                    fontFamily: HAND,
                    fontSize: 28,
                    marginTop: 14,
                    opacity: 0,
                    transform: "translateY(24px)",
                    color: "#F7C9D9",
                  }}
                >
                  {film.signoff}
                </div>
              </div>

              {/* The lock screen comes back as the camera pulls out. */}
              <div
                className="lock-ui"
                style={{ position: "absolute", inset: 0, opacity: 0 }}
              >
                <StatusIcons />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: CLOCK_TOP - 64,
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 32,
                    color: "#FBEFF6",
                    textAlign: "center",
                  }}
                >
                  {film.lockDates[1]}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: CLOCK_TOP,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <FlipClock
                    from="12:00"
                    to="12:01"
                    flipAt={MINUTE}
                    frame={frame}
                  />
                </div>
                <div
                  className="note"
                  style={{
                    position: "absolute",
                    left: NOTE.left,
                    top: NOTE.top,
                    width: NOTE.width,
                    opacity: 0,
                    transform: "translateY(-70px) scale(0.9)",
                  }}
                >
                  <Notification
                    title={film.notification[0]}
                    body={film.opened}
                    time="now"
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: SCREEN.width / 2 - 70,
                    bottom: 16,
                    width: 140,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgb(255 255 255 / 0.8)",
                  }}
                />
              </div>
            </div>
          </Phone>
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: dark }} />
    </AbsoluteFill>
  );
};
