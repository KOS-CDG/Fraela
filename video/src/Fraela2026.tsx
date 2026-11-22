import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import songA from "./audio/last-night-a.mp3";
import songB from "./audio/last-night-b.mp3";
import phoneIntro from "./audio/phone-intro.wav";
import phoneOutro from "./audio/phone-outro.wav";
import "./lib/fonts";
import { Fire } from "./scenes/Fire";
import { Finale, INTO_PHONE, SCREEN_OFF } from "./scenes/Finale";
import { Heartbeat } from "./scenes/Heartbeat";
import { Honor } from "./scenes/Honor";
import { MadeIt } from "./scenes/MadeIt";
import { Midnight } from "./scenes/Midnight";
import { Miles } from "./scenes/Miles";
import { Moonlight } from "./scenes/Moonlight";
import { PostcardScene } from "./scenes/PostcardScene";
import { Sent } from "./scenes/Sent";
import {
  BEAT,
  COLD_OPEN,
  EDIT,
  FILM_FRAMES,
  FPS,
  JUMP_TO_BAR,
  SCENES,
  SONG_FIRST_BEAT,
  songBar,
} from "./timeline";

// The song is mastered loud, so it plays well below full volume to leave
// room for the sound effects.
export const MUSIC_VOLUME = 0.5;

// Where each audio file starts in the song, in seconds. last-night-a.mp3 is
// the song from its start; last-night-b.mp3 was cut with ffmpeg's stream copy
// and its first sample is 205.98857 s into the song (measured by
// cross-correlation). The phone versions are the song filtered to sound like
// a phone speaker (see README).
const SONG_A_START = 0;
const SONG_B_START = 205.98857;
const PHONE_INTRO_START = 0;
const PHONE_OUTRO_START = 216;

// The film frame on which a moment of the song plays, before or after the edit.
const beforeEdit = (seconds: number) =>
  COLD_OPEN + (seconds - SONG_FIRST_BEAT) * FPS;
const afterEdit = (seconds: number) =>
  EDIT + (seconds - (SONG_FIRST_BEAT + JUMP_TO_BAR * 4)) * FPS;

// The song opens up from the phone's speaker to full sound as the camera dives
// into the postcard, and shrinks back into the phone when the camera pulls
// out at the end. Both are equal-power crossfades.
const OPEN_UP = [SCENES.postcard.from - 12, SCENES.postcard.from + 2] as const;
const INTO_PHONE_FADE = [INTO_PHONE, INTO_PHONE + 50] as const;
// The jump from the first chorus to the last: a short crossfade on the bar line.
const JUMP_FADE = [EDIT - 2, EDIT + 2] as const;
// Loud sound effects that the music ducks under for a moment.
const HITS = [songBar(12), songBar(17), songBar(52) + 3 * BEAT];

const progress = (f: number, [a, b]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (f - a) / (b - a)));
const fadeIn = (f: number, range: readonly [number, number]) =>
  Math.sin((progress(f, range) * Math.PI) / 2);
const fadeOut = (f: number, range: readonly [number, number]) =>
  Math.cos((progress(f, range) * Math.PI) / 2);
const duck = (f: number) =>
  HITS.reduce(
    (level, hit) =>
      f >= hit - 1
        ? Math.min(level, 1 - 0.3 * Math.exp(-(f - hit + 1) / 9))
        : level,
    1,
  );

// An audio file whose first sample belongs on film frame `at` (which may fall
// between frames), heard from frame `start` to frame `end`. `volume` gets
// film frames.
const Placed: React.FC<{
  readonly src: string;
  readonly at: number;
  readonly start: number;
  readonly end: number;
  readonly name: string;
  readonly volume: (filmFrame: number) => number;
}> = ({ src, at, start, end, name, volume }) => (
  <Sequence from={start} durationInFrames={end - start} name={name} layout="none">
    <Audio
      src={src}
      trimBefore={start - at}
      volume={(f) => MUSIC_VOLUME * volume(f + start)}
    />
  </Sequence>
);

// The music bed of the whole film: the song edit and its phone-speaker ends.
export const FilmMusic: React.FC = () => (
  <>
    <Placed
      name="Last Night on Earth, from the phone"
      src={phoneIntro}
      at={beforeEdit(PHONE_INTRO_START)}
      start={Math.ceil(beforeEdit(PHONE_INTRO_START))}
      end={OPEN_UP[1] + 1}
      volume={(f) => fadeOut(f, OPEN_UP)}
    />
    <Placed
      name="Last Night on Earth, intro to the first chorus"
      src={songA}
      at={beforeEdit(SONG_A_START)}
      start={OPEN_UP[0]}
      end={JUMP_FADE[1] + 1}
      volume={(f) => fadeIn(f, OPEN_UP) * fadeOut(f, JUMP_FADE) * duck(f)}
    />
    <Placed
      name="Last Night on Earth, last chorus and outro"
      src={songB}
      at={afterEdit(SONG_B_START)}
      start={JUMP_FADE[0]}
      end={INTO_PHONE_FADE[1] + 1}
      volume={(f) => fadeIn(f, JUMP_FADE) * fadeOut(f, INTO_PHONE_FADE) * duck(f)}
    />
    <Placed
      name="Last Night on Earth, back in the phone"
      src={phoneOutro}
      at={afterEdit(PHONE_OUTRO_START)}
      start={INTO_PHONE_FADE[0]}
      end={SCREEN_OFF + 8}
      volume={(f) =>
        fadeIn(f, INTO_PHONE_FADE) * fadeOut(f, [SCREEN_OFF, SCREEN_OFF + 6])
      }
    />
  </>
);

// The whole birthday film. Scenes are cut on the bar lines of the song
// (see timeline.ts); each scene brings its own sound effects.
export const Fraela2026: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07040B" }}>
    <Sequence name="Midnight" {...SCENES.midnight}>
      <Midnight />
    </Sequence>
    <Sequence name="The postcard" {...SCENES.postcard}>
      <PostcardScene />
    </Sequence>
    <Sequence name="Sent" {...SCENES.sent}>
      <Sent />
    </Sequence>
    <Sequence name="Moonlight" {...SCENES.moonlight}>
      <Moonlight />
    </Sequence>
    <Sequence name="Beating heart" {...SCENES.heartbeat}>
      <Heartbeat />
    </Sequence>
    <Sequence name="Miles" {...SCENES.miles}>
      <Miles />
    </Sequence>
    <Sequence name="Honor" {...SCENES.honor}>
      <Honor />
    </Sequence>
    <Sequence name="Fire" {...SCENES.fire}>
      <Fire />
    </Sequence>
    <Sequence name="Made it through" {...SCENES.madeIt}>
      <MadeIt />
    </Sequence>
    <Sequence name="Finale" {...SCENES.finale}>
      <Finale />
    </Sequence>
    <FilmMusic />
  </AbsoluteFill>
);

export { FILM_FRAMES };
