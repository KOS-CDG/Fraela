import { Audio } from "@remotion/media";
import { stagger } from "animejs";
import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import shutter from "../audio/shutter.wav";
import whoosh from "../audio/whoosh.mp3";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { STAR } from "../lib/Burst";
import { getChapter, photoSrc, TONES } from "../lib/content";
import { SANS } from "../lib/fonts";
import { BEAT, ms } from "../timeline";

const chapter = getChapter("stone");
const tone = TONES.stone;
const TILE_W = 300;
const TILE_H = 400;
const GAP = 24;
const LEFT = (1080 - 3 * TILE_W - 2 * GAP) / 2;
const TOP = 130;
// Each tile is wiped open from a different edge.
const HIDDEN = [
  "inset(0% 0% 100% 0%)",
  "inset(0% 0% 0% 100%)",
  "inset(100% 0% 0% 0%)",
  "inset(0% 100% 0% 0%)",
  "inset(0% 0% 100% 0%)",
  "inset(0% 0% 0% 100%)",
];
const SHOWN = "inset(0% 0% 0% 0%)";

// "Sage and stone": a photo per beat, each wiped open from a new side while
// the picture inside settles, under a ticker that keeps the title moving.
// On the last beat the tiles fly up and out of frame.
export const Stone: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      one(el, ".band"),
      { x: [-1700, 0], duration: 700, ease: "outExpo" },
      0,
    );
    all(el, ".tile").forEach((tile, i) => {
      tl.add(
        tile,
        { clipPath: [HIDDEN[i], SHOWN], duration: 420, ease: "outExpo" },
        ms(i * BEAT),
      );
      tl.add(
        tile.querySelector(".tile-photo") as HTMLElement,
        { scale: [1.4, 1], duration: 700, ease: "outExpo" },
        ms(i * BEAT),
      );
    });
    tl.add(
      all(el, ".tile"),
      {
        scale: [
          { to: 0.93, duration: 90, ease: "outQuad" },
          { to: 1, duration: 300, ease: "outBack(2)" },
        ],
      },
      stagger(35, { grid: [3, 2], from: "center", start: ms(6 * BEAT) }),
    );
    tl.add(
      all(el, ".tile"),
      { y: [0, -1500], rotate: [0, -8], duration: 380, ease: "inExpo" },
      stagger(30, { start: ms(7 * BEAT) - 60 }),
    );
    tl.add(
      one(el, ".band"),
      { x: [0, 1800], duration: 360, ease: "inExpo" },
      ms(7 * BEAT) + 60,
    );
  });

  // The title scrolls 9 px a frame; four copies cover the band for the whole scene.
  const ticker = -frame * 9;

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      <Audio src={whoosh} volume={0.5} />
      {chapter.photos.map((photo, i) => (
        <Audio key={photo.page} src={shutter} from={i * BEAT} volume={0.4} />
      ))}
      <Audio src={whoosh} from={7 * BEAT - 4} volume={0.65} />

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        {chapter.photos.map((photo, i) => (
          <div
            key={photo.page}
            className="tile"
            style={{
              position: "absolute",
              left: LEFT + (i % 3) * (TILE_W + GAP),
              top: TOP + Math.floor(i / 3) * (TILE_H + GAP),
              width: TILE_W,
              height: TILE_H,
              overflow: "hidden",
              clipPath: HIDDEN[i],
              boxShadow: "0 24px 48px rgb(20 14 24 / 0.4)",
            }}
          >
            <Img
              className="tile-photo"
              src={photoSrc(photo.page)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 35%",
                display: "block",
                transform: "scale(1.4)",
              }}
            />
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            left: -300,
            top: 1035,
            width: 1680,
            height: 190,
            rotate: "-6deg",
          }}
        >
          <div
            className="band"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: tone.accent,
              color: tone.bg,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              transform: "translateX(-1700px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                translate: `${ticker}px 0px`,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 112,
                letterSpacing: "-0.03em",
              }}
            >
              {Array.from({ length: 4 }, (_, i) => (
                <React.Fragment key={i}>
                  <span style={{ paddingRight: 48 }}>{chapter.title}</span>
                  <svg
                    viewBox="-10 -10 20 20"
                    width={60}
                    height={60}
                    style={{ marginRight: 48, rotate: `${frame * 4}deg` }}
                  >
                    <path d={STAR} fill={tone.bg} />
                  </svg>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
