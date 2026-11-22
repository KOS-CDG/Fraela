import React from "react";
import { Composition, Folder, Sequence } from "remotion";
import { FilmMusic, Fraela2026 } from "./Fraela2026";
import "./lib/fonts";
import { Fire } from "./scenes/Fire";
import { Finale } from "./scenes/Finale";
import { Heartbeat } from "./scenes/Heartbeat";
import { Honor } from "./scenes/Honor";
import { MadeIt } from "./scenes/MadeIt";
import { Midnight } from "./scenes/Midnight";
import { Miles } from "./scenes/Miles";
import { Moonlight } from "./scenes/Moonlight";
import { PostcardScene } from "./scenes/PostcardScene";
import { Sent } from "./scenes/Sent";
import { FILM_FRAMES, FPS, HEIGHT, SCENES, WIDTH } from "./timeline";

const size = { width: WIDTH, height: HEIGHT, fps: FPS };

// Each scene on its own, with the music it has in the film, for previewing
// in the Studio. The film's music bed is shifted so the scene's first frame
// hears what it hears in the film.
const withMusic = (Scene: React.FC, from: number) => {
  const Preview: React.FC = () => (
    <>
      <Scene />
      <Sequence from={-from} layout="none">
        <FilmMusic />
      </Sequence>
    </>
  );
  return Preview;
};

const scenes = [
  { id: "Midnight", Scene: Midnight, ...SCENES.midnight },
  { id: "Postcard", Scene: PostcardScene, ...SCENES.postcard },
  { id: "Sent", Scene: Sent, ...SCENES.sent },
  { id: "Moonlight", Scene: Moonlight, ...SCENES.moonlight },
  { id: "Heartbeat", Scene: Heartbeat, ...SCENES.heartbeat },
  { id: "Miles", Scene: Miles, ...SCENES.miles },
  { id: "Honor", Scene: Honor, ...SCENES.honor },
  { id: "Fire", Scene: Fire, ...SCENES.fire },
  { id: "MadeIt", Scene: MadeIt, ...SCENES.madeIt },
  { id: "Finale", Scene: Finale, ...SCENES.finale },
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
