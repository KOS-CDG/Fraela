import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import paper from "../audio/paper.wav";
import pen from "../audio/pen.wav";
import stamp from "../audio/stamp.wav";
import whoosh from "../audio/whoosh.mp3";
import { one, useAnimeTimeline } from "../lib/anime";
import {
  CARD_H,
  CARD_W,
  PostcardBack,
  PostcardFront,
  Postmark,
} from "../lib/Postcard";
import { BAR, BEAT, ms } from "../timeline";
import { POSTCARD_END_WIDTH } from "./Midnight";

// Scene frames. The scene starts on bar 2 of the song's piano intro.
const FLIP = BEAT;
const WRITE = 2 * BEAT;
const POSTMARK = BAR;
const ADDRESS = BAR + 10;
const TURN = BAR + 2 * BEAT;
const SEND = 2 * BAR - 18;
const START_SCALE = POSTCARD_END_WIDTH / CARD_W;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BOKEH = Array.from({ length: 14 }, (_, i) => ({
  x: random(`bokeh-x-${i}`) * 1080,
  y: random(`bokeh-y-${i}`) * 1350,
  size: 120 + random(`bokeh-size-${i}`) * 260,
  color: i % 3 === 0 ? "rgb(226 191 122 / 0.22)" : "rgb(242 141 178 / 0.18)",
  speed: 0.2 + random(`bokeh-speed-${i}`) * 0.5,
}));

// Bars 2 and 3 of the intro: the postcard from the phone. It turns over, the
// message writes itself, the midnight postmark lands on the downbeat, and the
// card flies off on the singer's first word as the band comes in.
export const PostcardScene: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    const card = one(el, ".card");
    tl.add(
      card,
      {
        scale: [START_SCALE, 1],
        rotate: [0, -2],
        duration: ms(28),
        ease: "outCubic",
      },
      0,
    );
    tl.add(
      card,
      { rotateY: [0, 180], duration: ms(26), ease: "inOutBack(1.2)" },
      ms(FLIP),
    );
    tl.add(
      one(el, ".postmark"),
      {
        opacity: [0, 1],
        scale: [1.9, 1],
        rotate: [-22, -10],
        duration: 260,
        ease: "outExpo",
      },
      ms(POSTMARK),
    );
    tl.add(
      card,
      {
        y: [
          { from: 0, to: 10, duration: 60, ease: "outQuad" },
          { to: 0, duration: 260, ease: "outElastic(1, .5)" },
        ],
      },
      ms(POSTMARK),
    );
    tl.add(
      card,
      {
        rotateY: [180, 360],
        rotate: [-2, 6],
        scale: [1, 0.86],
        duration: ms(40),
        ease: "inOutCubic",
      },
      ms(TURN),
    );
    tl.add(
      card,
      {
        x: [0, 900],
        y: [0, -1250],
        rotate: [6, 34],
        scale: [0.86, 0.45],
        duration: ms(18),
        ease: "inQuart",
      },
      ms(SEND),
    );
  });

  const message = interpolate(frame, [WRITE, WRITE + 50], [0, 1], clamp);
  const address = interpolate(
    frame,
    [ADDRESS + 6, ADDRESS + 50],
    [0, 1],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(90% 70% at 50% 45%, #3B1640 0%, #1A0B22 60%, #0B0612 100%)",
        overflow: "hidden",
      }}
    >
      <Audio src={paper} from={FLIP} volume={0.6} />
      <Audio src={whoosh} from={FLIP + 4} volume={0.25} />
      <Audio src={pen} from={WRITE} volume={0.55} />
      <Audio src={stamp} from={POSTMARK} volume={0.75} />
      <Audio src={pen} from={ADDRESS + 6} volume={0.45} />
      <Audio src={paper} from={TURN + 6} volume={0.45} />
      <Audio src={whoosh} from={SEND - 2} volume={0.55} />

      {BOKEH.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.size / 2,
            top: b.y - b.size / 2 - frame * b.speed,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${b.color}, transparent)`,
          }}
        />
      ))}

      <div
        ref={root}
        style={{ position: "absolute", inset: 0, perspective: 2200 }}
      >
        <div
          className="card"
          style={{
            position: "absolute",
            left: 540 - CARD_W / 2,
            top: 675 - CARD_H / 2,
            width: CARD_W,
            height: CARD_H,
            transformStyle: "preserve-3d",
            transform: `scale(${START_SCALE}) rotate(0deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              boxShadow: "0 40px 90px rgb(0 0 0 / 0.55)",
            }}
          >
            <PostcardFront />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: "0 40px 90px rgb(0 0 0 / 0.55)",
            }}
          >
            <PostcardBack message={message} address={address}>
              <Postmark
                className="postmark"
                style={{ left: 330, top: 120, opacity: 0 }}
              />
            </PostcardBack>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
