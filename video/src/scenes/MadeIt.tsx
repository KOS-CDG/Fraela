import { Audio } from "@remotion/media";
import React, { useCallback } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import impact from "../audio/impact.mp3";
import paper from "../audio/paper.wav";
import sparkle from "../audio/sparkle.mp3";
import stamp from "../audio/stamp.wav";
import whoosh from "../audio/whoosh.mp3";
import { one, useAnimeTimeline } from "../lib/anime";
import { CanvasLayer, drawEmbers } from "../lib/Canvas";
import { content } from "../lib/content";
import { SANS } from "../lib/fonts";
import {
  CARD_H,
  CARD_W,
  PostcardBack,
  PostcardFront,
  Postmark,
} from "../lib/Postcard";
import { BEAT, ms } from "../timeline";

const film = content.film;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene frames: one bar, the last of the final chorus.
const RISE = 4;
const FLIP = 54;
const STAMP = 3 * BEAT; // the music ducks under the stamp (see Fraela2026.tsx)
const THROUGH = 108; // the camera goes through the card on the last word

// Bar 52 of the song, after the jump to the last chorus: the postcard made it
// through the fire. It rises glowing out of the flare, turns over to the
// message, gets stamped as delivered, and the camera flies through it.
export const MadeIt: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    const card = one(el, ".card");
    tl.add(
      card,
      {
        y: [900, 0],
        rotate: [12, -3],
        scale: [0.55, 0.84],
        duration: ms(34),
        ease: "outCubic",
      },
      ms(RISE),
    );
    tl.add(
      card,
      { rotateY: [0, 180], duration: ms(24), ease: "inOutBack(1.2)" },
      ms(FLIP),
    );
    tl.add(
      one(el, ".delivered"),
      {
        opacity: [0, 1],
        scale: [2.4, 1],
        rotate: [-26, -12],
        duration: 230,
        ease: "outExpo",
      },
      ms(STAMP),
    );
    tl.add(
      card,
      {
        y: [
          { from: 0, to: 14, duration: 60, ease: "outQuad" },
          { to: 0, duration: 300, ease: "outElastic(1, .5)" },
        ],
      },
      ms(STAMP),
    );
    tl.add(
      card,
      { scale: [0.84, 3.4], duration: ms(14), ease: "inQuad" },
      ms(THROUGH),
    );
    tl.add(
      one(el, ".through"),
      { opacity: [1, 0], duration: ms(14), ease: "inQuad" },
      ms(THROUGH),
    );
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, f: number) =>
      drawEmbers(ctx, f, { count: 80, seed: "made-it", rgb: "255 190 110" }),
    [],
  );
  const flare = interpolate(frame, [0, 14], [1, 0], clamp);
  const glow = interpolate(
    frame,
    [RISE, 40, STAMP, STAMP + 4, 120],
    [0, 0.8, 0.6, 1, 0.7],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#140812", overflow: "hidden" }}>
      <Audio src={whoosh} from={RISE} volume={0.45} />
      <Audio src={paper} from={FLIP + 6} volume={0.6} />
      <Audio src={stamp} from={STAMP} volume={0.5} />
      <Audio src={impact} from={STAMP} volume={0.34} />
      <Audio src={whoosh} from={THROUGH - 8} volume={0.5} />
      <Audio src={sparkle} from={THROUGH} volume={0.3} />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 60% at 50% 60%, #6B2A3A 0%, #3B1640 45%, #140812 100%)",
        }}
      />
      <CanvasLayer draw={draw} />
      <div
        style={{
          position: "absolute",
          left: 540 - 520,
          top: 675 - 560,
          width: 1040,
          height: 1120,
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgb(255 214 150 / 0.55), transparent)",
          opacity: glow,
        }}
      />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        {/* Opacity on the card itself would flatten its 3D turn, so the fade
            is on this wrapper, which also holds the perspective. */}
        <div
          className="through"
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
              transform: "translateY(900px) rotate(12deg) scale(0.55)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                boxShadow:
                  "0 0 80px rgb(255 200 130 / 0.6), 0 40px 90px rgb(0 0 0 / 0.5)",
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
                boxShadow:
                  "0 0 80px rgb(255 200 130 / 0.6), 0 40px 90px rgb(0 0 0 / 0.5)",
              }}
            >
              <PostcardBack message={1} address={1}>
                <Postmark
                  style={{ left: 330, top: 120, transform: "rotate(-10deg)" }}
                />
                <div
                  className="delivered"
                  style={{
                    position: "absolute",
                    left: 290,
                    top: 812,
                    width: 380,
                    height: 128,
                    opacity: 0,
                    transform: "rotate(-26deg) scale(2.4)",
                    border: "7px solid #C2185B",
                    borderRadius: 18,
                    boxShadow:
                      "inset 0 0 0 5px #F6EBDD, inset 0 0 0 9px #C2185B",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C2185B",
                    fontFamily: SANS,
                    mixBlendMode: "multiply",
                  }}
                >
                  <div
                    style={{
                      fontSize: 54,
                      fontWeight: 800,
                      letterSpacing: 6,
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    {film.delivered}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: 4,
                      marginTop: 6,
                    }}
                  >
                    {film.postcard.postmark}
                  </div>
                </div>
              </PostcardBack>
            </div>
          </div>
        </div>
      </div>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 70% at 50% 55%, #FFFDF4 0%, #FFE7B0 45%, #FFB45A 100%)",
          opacity: flare,
        }}
      />
    </AbsoluteFill>
  );
};
