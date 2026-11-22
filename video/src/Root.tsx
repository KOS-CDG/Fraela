import { Audio } from "@remotion/media";
import React from "react";
import { Composition, Folder } from "remotion";
import lifetime from "./audio/lifetime.mp3";
import { Fraela2026, MUSIC_VOLUME } from "./Fraela2026";
import "./lib/fonts";
import { Bloom } from "./scenes/Bloom";
import { Finale } from "./scenes/Finale";
import { Gold } from "./scenes/Gold";
import { Mosaic } from "./scenes/Mosaic";
import { Opening } from "./scenes/Opening";
import { Stone } from "./scenes/Stone";
import { White } from "./scenes/White";
import {
  FILM_FRAMES,
  FPS,
  HEIGHT,
  MUSIC_START,
  SCENES,
  WIDTH,
} from "./timeline";

const size = { width: WIDTH, height: HEIGHT, fps: FPS };

// Each scene on its own, with its stretch of the music, for previewing in the Studio.
const withMusic = (Scene: React.FC, from: number) => {
  const Preview: React.FC = () => (
    <>
      <Scene />
      <Audio
        src={lifetime}
        trimBefore={MUSIC_START + from}
        volume={MUSIC_VOLUME}
      />
    </>
  );
  return Preview;
};

const scenes = [
  { id: "Opening", Scene: Opening, ...SCENES.opening },
  { id: "InBloom", Scene: Bloom, ...SCENES.bloom },
  { id: "SageAndStone", Scene: Stone, ...SCENES.stone },
  { id: "GoldenNight", Scene: Gold, ...SCENES.gold },
  { id: "InWhite", Scene: White, ...SCENES.white },
  { id: "EveryPhoto", Scene: Mosaic, ...SCENES.mosaic },
  { id: "Wish", Scene: Finale, ...SCENES.finale },
].map((scene) => ({ ...scene, Preview: withMusic(scene.Scene, scene.from) }));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Fraela2026-Scenes">
        {scenes.map(({ id, Preview, durationInFrames }) => (
          <Composition
            key={id}
            id={id}
            component={Preview}
            durationInFrames={durationInFrames}
            {...size}
          />
        ))}
      </Folder>
      <Composition
        id="Fraela2026"
        component={Fraela2026}
        durationInFrames={FILM_FRAMES}
        {...size}
      />
    </>
  );
};
