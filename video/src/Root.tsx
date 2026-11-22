import React from "react";
import { Composition, Folder } from "remotion";
import { Fraela2026 } from "./Fraela2026";
import "./lib/fonts";
import { BloomScene, StoneScene, WhiteScene } from "./scenes/ChapterScene";
import { Finale } from "./scenes/Finale";
import { GoldReel } from "./scenes/GoldReel";
import { Opening } from "./scenes/Opening";
import { FILM_FRAMES, FPS, HEIGHT, SCENE_FRAMES, WIDTH } from "./timeline";

const size = { width: WIDTH, height: HEIGHT, fps: FPS };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Fraela2026-Scenes">
        <Composition
          id="Opening"
          component={Opening}
          durationInFrames={SCENE_FRAMES.opening}
          {...size}
        />
        <Composition
          id="InBloom"
          component={BloomScene}
          durationInFrames={SCENE_FRAMES.bloom}
          {...size}
        />
        <Composition
          id="SageAndStone"
          component={StoneScene}
          durationInFrames={SCENE_FRAMES.stone}
          {...size}
        />
        <Composition
          id="GoldenNight"
          component={GoldReel}
          durationInFrames={SCENE_FRAMES.gold}
          {...size}
        />
        <Composition
          id="InWhite"
          component={WhiteScene}
          durationInFrames={SCENE_FRAMES.white}
          {...size}
        />
        <Composition
          id="Finale"
          component={Finale}
          durationInFrames={SCENE_FRAMES.finale}
          {...size}
        />
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
