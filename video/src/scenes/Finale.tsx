import { Audio } from "@remotion/media";
import { makeHeart } from "@remotion/shapes";
import { stagger, svg } from "animejs";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import cheer from "../audio/cheer.mp3";
import confetti from "../audio/confetti.mp3";
import ding from "../audio/ding.wav";
import impact from "../audio/impact.mp3";
import pop from "../audio/pop.mp3";
import sparkle from "../audio/sparkle.mp3";
import whoosh from "../audio/whoosh.mp3";
import { all, one, useAnimeTimeline } from "../lib/anime";
import { ConfettiCannons } from "../lib/Cannons";
import { Confetti } from "../lib/Confetti";
import { content, TONES } from "../lib/content";
import { SANS, SERIF } from "../lib/fonts";
import { Split } from "../lib/Split";
import { BAR, BEAT, ms } from "../timeline";

const tone = TONES.closing;
// The last hit of the music, at 40 s.
const HIT = 3 * BAR;
const heart = makeHeart({ height: 760 });
const HEART_X = 540;
const HEART_Y = 600;
const CONFETTI_COLORS = [
  tone.accent,
  TONES.night.accent,
  TONES.gold.accent,
  TONES.white.accent,
  TONES.bloom.accent,
  TONES.stone.accent,
];
const [happy, birthday, myLove] = content.film.finale;

// The wish. Words bounce in on the beat, a heart is drawn behind them and
// beats in time, and on the music's last hit two confetti cannons fire.
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();

  const root = useAnimeTimeline((tl, el) => {
    [".line-0 .char", ".line-1 .char"].forEach((selector, i) => {
      tl.add(
        all(el, selector),
        {
          opacity: [0, 1],
          y: [180, 0],
          rotate: [-20, 0],
          duration: 700,
          ease: "outElastic(1, .6)",
        },
        stagger(35, { start: ms(i * BEAT) }),
      );
    });
    tl.add(
      all(el, ".line-2 .char"),
      {
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [-30, 0],
        duration: 620,
        ease: "outBack(2.2)",
      },
      stagger(45, { start: ms(2 * BEAT), from: "center" }),
    );
    tl.add(
      svg.createDrawable(one(el, ".heart-line")),
      { draw: ["0 0", "0 1"], duration: 1300, ease: "inOutQuad" },
      ms(6),
    );
    tl.add(
      one(el, ".heart-fill"),
      { opacity: [0, 0.5], duration: 500, ease: "outQuad" },
      ms(40),
    );
    // The heart beats with the music, and jumps on the last hit.
    for (let beat = 4; beat < 20; beat++) {
      const big = beat * BEAT === HIT;
      tl.add(
        one(el, ".heart"),
        {
          scale: big
            ? [
                { to: 1.16, duration: 90, ease: "outQuad" },
                { to: 1, duration: 700, ease: "outElastic(1, .4)" },
              ]
            : [
                { to: 1.045, duration: 70, ease: "outQuad" },
                { to: 1, duration: 330, ease: "outQuad" },
              ],
        },
        ms(beat * BEAT),
      );
    }
    tl.add(
      all(el, ".note-word"),
      { opacity: [0, 1], y: [30, 0], duration: 500, ease: "outQuart" },
      stagger(70, { start: ms(4 * BEAT + 6) }),
    );

    tl.add(
      one(el, ".ring"),
      { opacity: [1, 0], scale: [0.2, 4.2], duration: 850, ease: "outExpo" },
      ms(HIT),
    );
    tl.add(
      all(el, ".line-0 .char, .line-1 .char"),
      {
        fontWeight: [
          { to: 380, duration: 110, ease: "outQuad" },
          { to: 900, duration: 600, ease: "outElastic(1, .5)" },
        ],
      },
      stagger(20, { start: ms(HIT) }),
    );
    tl.add(
      all(el, ".signoff-char"),
      {
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [-25, 0],
        duration: 800,
        ease: "outElastic(1, .5)",
      },
      stagger(45, { start: ms(HIT + 6) }),
    );
  });

  // A short, fading camera shake on the last hit.
  const t = frame - HIT;
  const shake = t >= 0 && t < 30 ? 22 * Math.exp(-t / 6) : 0;
  const shakeX = shake * Math.sin(t * 2.3);
  const shakeY = shake * Math.cos(t * 1.9);

  return (
    <AbsoluteFill
      style={{ backgroundColor: tone.bg, color: tone.ink, overflow: "hidden" }}
    >
      <Audio src={pop} volume={0.55} />
      <Audio src={pop} from={BEAT} volume={0.55} />
      <Audio src={pop} from={2 * BEAT} volume={0.6} />
      <Audio src={sparkle} from={40} volume={0.5} />
      <Audio src={whoosh} from={4 * BEAT + 4} volume={0.35} />
      {/* The three hits are a few frames apart, so their peaks don't stack. */}
      <Audio src={impact} from={HIT} volume={0.55} />
      <Audio src={confetti} from={HIT + 2} volume={0.45} />
      <Audio src={cheer} from={HIT + 5} volume={0.5} />
      <Audio src={ding} from={HIT + 14} volume={0.3} />
      <Audio src={sparkle} from={HIT + 20} volume={0.6} />

      <div
        ref={root}
        style={{
          position: "absolute",
          inset: 0,
          translate: `${shakeX}px ${shakeY}px`,
        }}
      >
        <div
          className="heart"
          style={{
            position: "absolute",
            left: HEART_X - heart.width / 2 - 10,
            top: HEART_Y - heart.height / 2 - 10,
            width: heart.width + 20,
            height: heart.height + 20,
          }}
        >
          <svg
            width={heart.width + 20}
            height={heart.height + 20}
            viewBox={`-10 -10 ${heart.width + 20} ${heart.height + 20}`}
          >
            <path
              className="heart-fill"
              d={heart.path}
              fill={TONES.night.accent}
              style={{ opacity: 0 }}
            />
            <path
              className="heart-line"
              d={heart.path}
              fill="none"
              stroke={tone.accent}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          className="ring"
          style={{
            position: "absolute",
            left: HEART_X - 150,
            top: HEART_Y - 150,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: `12px solid ${tone.accent}`,
            opacity: 0,
          }}
        />

        {[happy, birthday].map((line, i) => (
          <div
            key={line}
            className={`line-${i}`}
            style={{
              position: "absolute",
              left: 80,
              top: 150 + i * 160,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: i === 0 ? 180 : 160,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            <Split text={line} className="char" style={{ fontWeight: 900 }} />
          </div>
        ))}
        <div
          className="line-2"
          style={{
            position: "absolute",
            left: 80,
            top: 470,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 220,
            lineHeight: 1,
            color: tone.accent,
          }}
        >
          <Split text={myLove} className="char" />
        </div>

        <div
          style={{
            position: "absolute",
            left: 80,
            right: 130,
            top: 790,
            fontFamily: SERIF,
            fontSize: 60,
            lineHeight: 1.15,
          }}
        >
          <Split
            text={content.film.finaleNote}
            className="note-word"
            by="word"
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 80,
            top: 1085,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 120,
            lineHeight: 1,
            color: tone.accent,
          }}
        >
          <Split text={content.closing.signoff} className="signoff-char" />
        </div>
      </div>

      <Confetti
        count={60}
        colors={CONFETTI_COLORS}
        seed="birthday-fall"
        start={HIT + 24}
      />
      <ConfettiCannons
        start={HIT}
        count={150}
        colors={CONFETTI_COLORS}
        seed="birthday"
      />
    </AbsoluteFill>
  );
};
