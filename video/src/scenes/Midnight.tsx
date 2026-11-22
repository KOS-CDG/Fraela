import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import ding from "../audio/ding.wav";
import flip from "../audio/flip.wav";
import buzz from "../audio/phone-buzz.wav";
import sparkle from "../audio/sparkle.mp3";
import tap from "../audio/tap.wav";
import whoosh from "../audio/whoosh.mp3";
import { one, useAnimeTimeline } from "../lib/anime";
import { content } from "../lib/content";
import { SANS } from "../lib/fonts";
import {
  changedDigits,
  FlipClock,
  Notification,
  Phone,
  SCREEN,
  StatusIcons,
  Wallpaper,
} from "../lib/Phone";
import { PostcardFront } from "../lib/Postcard";
import { Sparkles } from "../lib/Sparkles";
import { BAR, BEAT, COLD_OPEN, ms } from "../timeline";

const film = content.film;
const BEFORE = "11:59";
const AFTER = "12:00";
// The clock flips on the song's first piano chord.
const MIDNIGHT = COLD_OPEN;
const NOTIFY = COLD_OPEN + 2 * BEAT;
const TAP = COLD_OPEN + BAR;
const OPENED = TAP + 36;
const PUSH_IN = COLD_OPEN + 2 * BAR - 32;
const END = COLD_OPEN + 2 * BAR;

// Where things sit on the lock screen, in screen pixels.
const CLOCK_TOP = 200;
const CLOCK_CENTER = SCREEN.top + CLOCK_TOP + 86;
const NOTE = { left: 26, top: 760, width: SCREEN.width - 52, height: 140 };
// The postcard as the phone shows it, and the zoom that makes it fill the film.
const CARD_IN_PHONE = 520;
const FILL = 1080 / CARD_IN_PHONE;
const HOLD_ZOOM = 1.03;
// How wide the postcard is on the scene's last frame; the next scene starts there.
export const POSTCARD_END_WIDTH = CARD_IN_PHONE * FILL * HOLD_ZOOM;
// The camera starts close on the clock, centred in the frame.
const START_SCALE = 1.85;
const START_Y = (675 - CLOCK_CENTER) * START_SCALE;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The hook. One beat of silence and a buzzing phone at 11:59; the clock flips
// to midnight on the first piano chord, a postcard arrives, she taps it, and
// the camera dives into it. The song plays from the phone's speaker until then.
export const Midnight: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      one(el, ".camera"),
      {
        y: [START_Y, 0],
        scale: [START_SCALE, 1],
        duration: ms(52),
        ease: "inOutCubic",
      },
      ms(MIDNIGHT + 14),
    );
    tl.add(
      one(el, ".camera"),
      { scale: [1, FILL], duration: ms(END - PUSH_IN), ease: "inQuart" },
      ms(PUSH_IN),
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
      ms(NOTIFY),
    );
    tl.add(
      one(el, ".note"),
      {
        scale: [
          { to: 0.95, duration: 90, ease: "outQuad" },
          { to: 1, duration: 200, ease: "outQuad" },
        ],
      },
      ms(TAP),
    );
    tl.add(
      one(el, ".expander"),
      {
        opacity: { from: 0, to: 1, duration: 120 },
        left: [NOTE.left, 0],
        top: [NOTE.top, 0],
        width: [NOTE.width, SCREEN.width],
        height: [NOTE.height, SCREEN.height],
        borderRadius: [36, SCREEN.radius],
        duration: ms(OPENED - TAP - 4),
        ease: "inOutQuart",
      },
      ms(TAP + 4),
    );
    tl.add(
      one(el, ".card"),
      {
        scale: [0.22, 1],
        rotate: [-4, 0],
        duration: ms(OPENED - TAP),
        ease: "inOutQuart",
      },
      ms(TAP + 4),
    );
  });

  // The phone shakes while it buzzes, two pulses at the start.
  const buzzing = (frame >= 2 && frame < 12) || (frame >= 16 && frame < 26);
  const shake = buzzing ? (frame % 2 ? 5 : -5) : 0;
  // The screen wakes up: dark to bright over the first frames.
  const wake = interpolate(frame, [0, 6], [0, 1], clamp);
  const midnightGlow = interpolate(
    frame,
    [MIDNIGHT, MIDNIGHT + 4, MIDNIGHT + 40],
    [0, 1, 0.25],
    clamp,
  );
  const dateSwap = interpolate(frame, [MIDNIGHT + 2, MIDNIGHT + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const lockFade = interpolate(frame, [TAP + 6, OPENED], [1, 0], clamp);
  const ripple = interpolate(frame, [TAP, TAP + 16], [0, 1], clamp);
  const drift = interpolate(frame, [OPENED, END], [1, HOLD_ZOOM], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07040B", overflow: "hidden" }}>
      <Audio src={buzz} from={2} volume={0.75} />
      {Array.from({ length: changedDigits(BEFORE, AFTER) }, (_, i) => (
        <Audio key={i} src={flip} from={MIDNIGHT + i * 3} volume={0.55} />
      ))}
      <Audio src={sparkle} from={MIDNIGHT} volume={0.22} />
      <Audio src={ding} from={NOTIFY} volume={0.4} />
      <Audio src={tap} from={TAP} volume={0.8} />
      <Audio src={whoosh} from={TAP + 6} volume={0.25} />
      <Audio src={whoosh} from={PUSH_IN + 10} volume={0.5} />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 45% at 50% 52%, rgb(140 58 120 / 0.35), transparent 70%)",
          opacity: wake,
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate: `${shake}px 0px`,
            }}
          >
            <Phone>
              <div style={{ position: "absolute", inset: 0, opacity: wake }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: lockFade,
                    filter: `blur(${(1 - lockFade) * 12}px)`,
                  }}
                >
                  <Wallpaper />
                  <StatusIcons />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: CLOCK_TOP - 70,
                      height: 50,
                      overflow: "hidden",
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 32,
                      color: "#FBEFF6",
                      textAlign: "center",
                    }}
                  >
                    {film.lockDates.map((date, i) => (
                      <div
                        key={date}
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 6 + (i - dateSwap) * 50,
                          opacity: i === 0 ? 1 - dateSwap : dateSwap,
                        }}
                      >
                        {date}
                      </div>
                    ))}
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
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 86,
                        width: 520,
                        height: 320,
                        translate: "-50% -50%",
                        background:
                          "radial-gradient(closest-side, rgb(242 141 178 / 0.55), transparent)",
                        opacity: midnightGlow,
                      }}
                    />
                    <FlipClock
                      from={BEFORE}
                      to={AFTER}
                      flipAt={MIDNIGHT}
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
                    }}
                  >
                    <Notification
                      title={film.notification[0]}
                      body={film.notification[1]}
                      time="now"
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: NOTE.left + NOTE.width / 2 - 60,
                      top: NOTE.top + NOTE.height / 2 - 60,
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      opacity:
                        ripple > 0 && ripple < 1 ? 0.45 * (1 - ripple) : 0,
                      scale: 0.3 + ripple * 2.4,
                    }}
                  />
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
                <div
                  className="expander"
                  style={{
                    position: "absolute",
                    left: NOTE.left,
                    top: NOTE.top,
                    width: NOTE.width,
                    height: NOTE.height,
                    borderRadius: 36,
                    overflow: "hidden",
                    backgroundColor: "#0D0713",
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      translate: "-50% -50%",
                    }}
                  >
                    <div
                      className="card"
                      style={{ transform: "scale(0.22) rotate(-4deg)" }}
                    >
                      <div style={{ scale: drift }}>
                        <PostcardFront
                          width={CARD_IN_PHONE}
                          style={{ boxShadow: "0 30px 80px rgb(0 0 0 / 0.6)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Phone>
          </div>
        </div>
      </div>

      <Sparkles count={14} color="#F6D8E6" seed="midnight" start={MIDNIGHT} />
    </AbsoluteFill>
  );
};
