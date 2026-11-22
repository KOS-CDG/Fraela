import { Audio } from "@remotion/media";
import { stagger } from "animejs";
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import ding from "../audio/ding.wav";
import pop from "../audio/pop.mp3";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { allPhotos, content, photoSrc, TONES } from "../lib/content";
import { SERIF } from "../lib/fonts";
import { Split } from "../lib/Split";
import { BAR, BEAT, ms } from "../timeline";

const tone = TONES.film;
const COLS = 5;
const TILE_W = 156;
const TILE_H = 208;
const GAP = 12;
const GRID_W = COLS * TILE_W + (COLS - 1) * GAP;
const GRID_H = COLS * TILE_H + (COLS - 1) * GAP;
const LEFT = (1080 - GRID_W) / 2;
const TOP = 210;
// The tiles that stay lit to draw a heart, row by row.
const HEART = [
  0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0,
];
const CENTRE = Math.floor((COLS * COLS) / 2);
const ZOOM = 2 * BAR + 2 * BEAT - 4;
const [firstLine, secondLine] = content.film.mosaic;

// Every photo of the year at once: the 25 tiles pop out from the middle,
// ripple on each bar, light up as a heart, and then the camera dives into the
// centre tile, which turns into the pink of the birthday wish.
export const Mosaic: React.FC = () => {
  const root = useAnimeTimeline((tl, el) => {
    const tiles = all(el, ".tile");
    tl.add(
      tiles,
      {
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [-30, 0],
        duration: 520,
        ease: "outBack(1.7)",
      },
      stagger(65, { grid: [COLS, COLS], from: "center" }),
    );
    tl.add(
      all(el, ".line-1 .word"),
      { opacity: [0, 1], y: [40, 0], duration: 450, ease: "outBack(2)" },
      stagger(60, { start: ms(4) }),
    );
    tl.add(
      all(el, ".line-1 .word"),
      { opacity: [1, 0], y: [0, -40], duration: 220, ease: "inQuad" },
      stagger(30, { start: ms(BAR - 8) }),
    );
    tl.add(
      all(el, ".line-2 .word"),
      { opacity: [0, 1], y: [40, 0], duration: 450, ease: "outBack(2)" },
      stagger(60, { start: ms(BAR) }),
    );
    tl.add(
      tiles,
      {
        scale: [
          { to: 0.8, duration: 140, ease: "outQuad" },
          { to: 1, duration: 320, ease: "outBack(2.2)" },
        ],
      },
      stagger(45, { grid: [COLS, COLS], from: "first", start: ms(BAR) }),
    );
    tl.add(
      tiles,
      { rotateY: [0, 360], duration: 650, ease: "inOutQuart" },
      stagger(40, {
        grid: [COLS, COLS],
        from: "last",
        start: ms(BAR + 2 * BEAT),
      }),
    );
    // The heart: the tiles outside it fade back while the tiles inside lift.
    tiles.forEach((tile, i) => {
      tl.add(
        tile,
        HEART[i]
          ? { scale: [1, 1.07], duration: 420, ease: "outBack(3)" }
          : {
              opacity: [1, 0.14],
              scale: [1, 0.84],
              duration: 420,
              ease: "outQuad",
            },
        ms(2 * BAR) +
          Math.abs((i % COLS) - 2) * 30 +
          Math.abs(Math.floor(i / COLS) - 2) * 30,
      );
    });
    tl.add(
      all(el, ".glow"),
      { opacity: [0, 1], duration: 300, ease: "outQuad" },
      stagger(30, { start: ms(2 * BAR) }),
    );
    tl.add(
      all(el, ".line-2 .word"),
      { opacity: [1, 0], duration: 200 },
      ms(ZOOM),
    );
    tl.add(
      one(el, ".zoom"),
      { scale: [1, 7.6], duration: ms(BAR - 2 * BEAT + 4), ease: "inExpo" },
      ms(ZOOM),
    );
    tl.add(
      one(el, ".blush"),
      { opacity: [0, 1], duration: ms(22), ease: "inQuad" },
      ms(ZOOM + 4),
    );
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      <Audio src={whoosh} volume={0.5} />
      <Audio src={sparkle} volume={0.5} />
      <Audio src={pop} from={2} volume={0.35} />
      <Audio src={pop} from={6} volume={0.35} />
      <Audio src={pop} from={10} volume={0.35} />
      <Audio src={whoosh} from={BAR} volume={0.4} />
      <Audio src={whoosh} from={BAR + 2 * BEAT} volume={0.4} />
      <Audio src={ding} from={2 * BAR} volume={0.5} />
      <Audio src={whoosh} from={ZOOM} volume={0.75} />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        <div
          className="zoom"
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `540px ${TOP + GRID_H / 2}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: LEFT,
              top: TOP,
              width: GRID_W,
              height: GRID_H,
              perspective: 1400,
            }}
          >
            {allPhotos.map((photo, i) => (
              <div
                key={photo.page}
                className="tile"
                style={{
                  position: "absolute",
                  left: (i % COLS) * (TILE_W + GAP),
                  top: Math.floor(i / COLS) * (TILE_H + GAP),
                  width: TILE_W,
                  height: TILE_H,
                  opacity: 0,
                }}
              >
                <Img
                  src={photoSrc(photo.page)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                    display: "block",
                  }}
                />
                {HEART[i] ? (
                  <div
                    className="glow"
                    style={{
                      position: "absolute",
                      inset: -6,
                      border: `5px solid ${tone.accent}`,
                      boxShadow: `0 0 34px ${tone.accent}`,
                      opacity: 0,
                    }}
                  />
                ) : null}
                {i === CENTRE ? (
                  <div
                    className="blush"
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: TONES.closing.bg,
                      opacity: 0,
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {[firstLine, secondLine].map((line, i) => (
          <div
            key={line}
            className={`line-${i + 1}`}
            style={{
              position: "absolute",
              left: 60,
              right: 60,
              top: 72,
              textAlign: "center",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 76,
              lineHeight: 1.05,
            }}
          >
            <Split text={line} className="word" by="word" />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
