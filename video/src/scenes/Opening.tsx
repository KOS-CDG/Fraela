import { Audio } from "@remotion/media";
import { stagger } from "animejs";
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import confetti from "../audio/confetti.mp3";
import impact from "../audio/impact.mp3";
import pop from "../audio/pop.mp3";
import riser from "../audio/riser.mp3";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { addBurst, Burst, STAR } from "../lib/Burst";
import { allPhotos, content, photoSrc, TONES } from "../lib/content";
import { SANS, SERIF } from "../lib/fonts";
import { usePreloadedImages } from "../lib/preload";
import { Split } from "../lib/Split";
import { Sunburst } from "../lib/Sunburst";
import { BAR, BEAT, ms } from "../timeline";

const tone = TONES.night;
const DIGITS = content.year.split("");
// Each digit first wears one chapter's colour, then becomes a window onto her photos.
const DIGIT_COLORS = [
  TONES.night.accent,
  TONES.bloom.accent,
  TONES.stone.accent,
  TONES.gold.accent,
];
const PHOTO_URLS = allPhotos.map((photo) => photoSrc(photo.page));
const [smallLine, ...bigLines] = content.film.opening;
// Everything is pulled into the middle on the song's pickup into the band.
const SUCK_IN = 4 * BAR - 18;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Bars 1 to 4, over the song's intro: the year slams in a digit per beat, fills
// with photos that change on every beat, "was a full blast" bounces in and
// bursts, then the riser pulls everything into one spark as the band comes in.
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  usePreloadedImages(PHOTO_URLS);

  const root = useAnimeTimeline((tl, el) => {
    const digits = all(el, ".digit");
    digits.forEach((digit, i) => {
      tl.add(
        digit,
        {
          opacity: [0, 1],
          scale: [2.8, 1],
          rotate: [i % 2 ? 24 : -24, 0],
          y: [-60, 0],
          duration: 700,
          ease: "outElastic(1, .55)",
        },
        ms(i * BEAT),
      );
    });
    // Once the photos are inside, the digits kick on every beat, left to right.
    for (let beat = 4; beat < 14; beat++) {
      tl.add(
        digits,
        {
          scale: [
            { to: 1.07, duration: 60, ease: "outQuad" },
            { to: 1, duration: 280, ease: "outQuad" },
          ],
        },
        stagger(25, { start: ms(beat * BEAT) }),
      );
    }

    tl.add(
      all(el, ".small-char"),
      { opacity: [0, 1], y: [70, 0], duration: 500, ease: "outBack(2)" },
      stagger(28, { start: ms(2 * BAR) }),
    );
    all(el, ".big-line").forEach((line, i) => {
      tl.add(
        line.querySelectorAll(".big-char"),
        i === 0
          ? {
              opacity: [0, 1],
              y: [240, 0],
              rotate: [-18, 0],
              duration: 650,
              ease: "outElastic(1, .6)",
            }
          : {
              opacity: [0, 1],
              scale: [0, 1],
              rotate: [-35, 0],
              duration: 600,
              ease: "outBack(2.4)",
            },
        stagger(i === 0 ? 40 : 35, {
          start: ms(2 * BAR + (i + 1) * BEAT),
          from: i === 0 ? "first" : "center",
        }),
      );
    });
    addBurst(tl, el, "blast", ms(2 * BAR + 2 * BEAT));

    // The big words breathe: their weight dips and springs back on each beat.
    for (let beat = 11; beat < 15; beat++) {
      tl.add(
        all(el, ".big-char"),
        {
          fontWeight: [
            { to: 320, duration: 150, ease: "outQuad" },
            { to: 900, duration: 300, ease: "outBack(2)" },
          ],
        },
        stagger(22, { start: ms(beat * BEAT) }),
      );
    }

    tl.add(
      one(el, ".stage"),
      { scale: [1, 0], rotate: [0, 40], duration: ms(13), ease: "inBack(2.2)" },
      ms(SUCK_IN),
    );
    tl.add(
      one(el, ".spark"),
      {
        scale: [
          { from: 0, to: 1.5, duration: ms(4), ease: "outBack(3)" },
          { to: 0.8, duration: ms(5), ease: "inOutSine" },
        ],
        rotate: [0, 90],
        duration: ms(9),
      },
      ms(SUCK_IN + 9),
    );
  });

  // From bar 2, every beat brings four new photos into the digits.
  const beat = Math.floor((frame - BAR) / BEAT);
  const photoFor = (i: number) =>
    PHOTO_URLS[(beat * DIGITS.length + i) % PHOTO_URLS.length];
  const sinceBeat = frame % BEAT;

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      <Audio src={pop} volume={0.6} />
      <Audio src={pop} from={BEAT} volume={0.6} />
      <Audio src={pop} from={2 * BEAT} volume={0.6} />
      <Audio src={pop} from={3 * BEAT} volume={0.7} />
      <Audio src={whoosh} from={BAR - 3} volume={0.6} />
      <Audio src={sparkle} from={BAR} volume={0.6} />
      <Audio src={pop} from={2 * BAR} volume={0.55} />
      <Audio src={pop} from={2 * BAR + BEAT} volume={0.6} />
      <Audio src={impact} from={2 * BAR + 2 * BEAT} volume={0.3} />
      <Audio src={confetti} from={2 * BAR + 2 * BEAT} volume={0.4} />
      <Audio src={riser} from={4 * BAR - 56} volume={0.6} />

      <div
        style={{
          position: "absolute",
          left: 540,
          top: 675,
          opacity: interpolate(frame, [SUCK_IN, SUCK_IN + 12], [0.9, 0], clamp),
          rotate: `${interpolate(frame, [0, 4 * BAR], [0, 70], { easing: Easing.in(Easing.quad) })}deg`,
          scale: 1 + 0.05 * Math.exp(-sinceBeat / 4),
        }}
      >
        <Sunburst color="#33183D" size={2600} rays={20} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          scale:
            interpolate(frame, [3 * BAR, SUCK_IN], [1, 1.1], {
              ...clamp,
              easing: Easing.in(Easing.quad),
            }) + (frame < SUCK_IN ? 0.025 * Math.exp(-sinceBeat / 3) : 0),
        }}
      >
        <div ref={root} style={{ position: "absolute", inset: 0 }}>
          <div className="stage" style={{ position: "absolute", inset: 0 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 170,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 390,
                lineHeight: 0.9,
                letterSpacing: "-0.05em",
              }}
            >
              {DIGITS.map((digit, i) => {
                const photo = frame >= BAR;
                return (
                  <span
                    key={i}
                    className="digit"
                    style={{
                      display: "inline-block",
                      opacity: 0,
                      padding: "0 0.03em",
                      color: photo ? "transparent" : DIGIT_COLORS[i],
                      backgroundImage: photo ? `url(${photoFor(i)})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center 28%",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextStroke: photo
                        ? `5px ${DIGIT_COLORS[i]}`
                        : undefined,
                    }}
                  >
                    {digit}
                  </span>
                );
              })}
            </div>

            <div
              style={{
                position: "absolute",
                left: 84,
                top: 580,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 120,
                lineHeight: 1,
              }}
            >
              <Split text={smallLine} className="small-char" />
            </div>

            {bigLines.map((line, i) => (
              <div
                key={line}
                className="big-line"
                style={{
                  position: "absolute",
                  left: 64,
                  top: 700 + i * 230,
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 280,
                  lineHeight: 0.85,
                  letterSpacing: "-0.04em",
                  color: i === bigLines.length - 1 ? tone.accent : tone.ink,
                }}
              >
                <Split
                  text={line}
                  className="big-char"
                  style={{ fontWeight: 900 }}
                />
              </div>
            ))}

            <Burst
              id="blast"
              x={400}
              y={1050}
              count={30}
              colors={[
                tone.accent,
                TONES.bloom.accent,
                TONES.stone.accent,
                TONES.gold.accent,
                tone.ink,
              ]}
              spread={520}
            />
          </div>

          <svg
            className="spark"
            viewBox="-10 -10 20 20"
            width={120}
            height={120}
            style={{
              position: "absolute",
              left: 480,
              top: 615,
              transform: "scale(0)",
            }}
          >
            <path d={STAR} fill={tone.accent} />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
