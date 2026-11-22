import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { stagger } from "animejs";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  type EasingFunction,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import shutter from "../audio/shutter.wav";
import sparkle from "../audio/sparkle.mp3";
import whip from "../audio/whip.wav";
import whoosh from "../audio/whoosh.mp3";
import { all, useAnimeTimeline } from "../lib/anime";
import { getChapter, photoSrc, TONES } from "../lib/content";
import { SERIF } from "../lib/fonts";
import { Sparkles } from "../lib/Sparkles";
import { Split } from "../lib/Split";
import { BEAT, ms } from "../timeline";

const chapter = getChapter("gold");
const tone = TONES.gold;
const PHOTO_W = 600;
const PHOTO_H = 800;
const STEP = PHOTO_W + 90;
const REEL_TOP = 270;
// The beats on which each photo lands in the middle: every two beats, then every beat.
const LANDS = [0, 2, 4, 6, 7, 8, 9, 10, 11].map((beat) => beat * BEAT);
// Frames a whip pan takes.
const WHIP = 9;
// The reel freezes on the song's accent at STOP, and the flash fires a beat later.
const STOP = 14 * BEAT;
const FLASH = 15 * BEAT - 1;
const last = chapter.photos[chapter.photos.length - 1];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Where the reel sits on each frame: it drifts while a photo is held, then
// whips to the next one. Drift scales with how long the photo is held.
const reelKeys = () => {
  const input: number[] = [];
  const output: number[] = [];
  const easing: EasingFunction[] = [];
  LANDS.forEach((land, i) => {
    const centred = 540 - (i * STEP + PHOTO_W / 2);
    const holdEnd = i < LANDS.length - 1 ? LANDS[i + 1] - WHIP : STOP;
    const drift = (holdEnd - land) * 1.1;
    input.push(land, holdEnd);
    output.push(centred + drift / 2, centred - drift / 2);
    easing.push(Easing.linear);
    if (i < LANDS.length - 1) {
      easing.push(Easing.bezier(0.7, 0, 0.2, 1));
    }
  });
  return { input, output, easing };
};
const KEYS = reelKeys();

const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, KEYS.input, KEYS.output, {
    ...clamp,
    easing: KEYS.easing,
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: REEL_TOP,
          left: 0,
          translate: `${x}px 0px`,
        }}
      >
        {chapter.photos.map((photo, i) => (
          <div
            key={photo.page}
            style={{
              position: "absolute",
              left: i * STEP,
              width: PHOTO_W,
              height: PHOTO_H,
              overflow: "hidden",
              outline: `2px solid ${tone.accent}`,
              outlineOffset: 10,
            }}
          >
            <Img
              src={photoSrc(photo.page)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                scale: 1.15,
                // The picture slides a little slower than its frame.
                translate: `${((x + i * STEP + PHOTO_W / 2 - 540) / 1080) * -6}% 0%`,
              }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CORNERS = [
  { left: 216, top: REEL_TOP - 24, rotate: 0 },
  { left: 864 - 90, top: REEL_TOP - 24, rotate: 90 },
  { left: 864 - 90, top: REEL_TOP + PHOTO_H + 24 - 90, rotate: 180 },
  { left: 216, top: REEL_TOP + PHOTO_H + 24 - 90, rotate: 270 },
];

// "Golden night": the page's sideways reel at full speed. Whip pans with real
// camera motion blur, accelerating from every two beats to every beat, a shine
// running over the title, then a freeze and a camera flash.
export const Gold: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    tl.add(
      all(el, ".gold-char"),
      { opacity: [0, 1], y: [-130, 0], duration: 650, ease: "outBack(2)" },
      stagger(30, { start: ms(4) }),
    );
    tl.add(
      all(el, ".caption-word"),
      { opacity: [0, 1], y: [34, 0], duration: 500, ease: "outQuart" },
      stagger(55, { start: ms(LANDS[LANDS.length - 1] + 3) }),
    );
    tl.add(
      all(el, ".corner"),
      { opacity: [0, 1], scale: [1.7, 1], duration: 280, ease: "outExpo" },
      stagger(25, { start: ms(STOP) }),
    );
  });

  const shine = interpolate(frame % 50, [0, 50], [100, 0]);
  // Blur is only visible while the reel whips; the slow drift between whips
  // renders without it, which keeps the render fast.
  const moving = LANDS.slice(1).some(
    (land) => frame >= land - WHIP && frame <= land + 1,
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      <Audio src={whoosh} volume={0.6} />
      <Audio src={sparkle} from={6} volume={0.6} />
      {LANDS.slice(1).map((land) => (
        <Audio key={land} src={whip} from={land - 6} volume={0.55} />
      ))}
      <Audio src={sparkle} from={LANDS[LANDS.length - 1]} volume={0.5} />
      <Audio src={shutter} from={FLASH} volume={0.85} />

      <Sparkles count={40} color={tone.accent} seed="gold" />

      <AbsoluteFill
        style={{
          scale: interpolate(frame, [STOP, FLASH], [1, 1.035], clamp),
        }}
      >
        {moving ? (
          <CameraMotionBlur shutterAngle={220} samples={7}>
            <Reel />
          </CameraMotionBlur>
        ) : (
          <Reel />
        )}
      </AbsoluteFill>

      <div ref={root} style={{ position: "absolute", inset: 0 }}>
        {[false, true].map((isShine) => (
          <div
            key={String(isShine)}
            style={{
              position: "absolute",
              left: 80,
              top: 90,
              fontFamily: SERIF,
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: isShine ? "#FFF7E3" : tone.accent,
              ...(isShine
                ? {
                    WebkitMaskImage:
                      "linear-gradient(100deg, transparent 38%, #000 50%, transparent 62%)",
                    WebkitMaskSize: "300% 100%",
                    WebkitMaskPosition: `${shine}% 0%`,
                    WebkitMaskRepeat: "no-repeat",
                  }
                : {}),
            }}
          >
            <Split text={chapter.title} className="gold-char" />
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            top: 1112,
            textAlign: "center",
            textWrap: "balance",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 58,
            lineHeight: 1.12,
          }}
        >
          <Split text={last.caption} className="caption-word" by="word" />
        </div>

        {CORNERS.map((corner, i) => (
          <div
            key={i}
            className="corner"
            style={{
              position: "absolute",
              left: corner.left,
              top: corner.top,
              width: 90,
              height: 90,
              borderTop: `8px solid ${tone.ink}`,
              borderLeft: `8px solid ${tone.ink}`,
              rotate: `${corner.rotate}deg`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <AbsoluteFill
        style={{
          backgroundColor: "#FFFFFF",
          opacity: interpolate(frame, [FLASH, FLASH + 3], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
