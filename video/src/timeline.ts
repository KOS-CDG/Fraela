// One place for the film's size and scene lengths (frames at 30 fps).
// The scenes overlap by TRANSITION frames, so the film is shorter than their sum.
// The total, 1370 frames (45.7 s), ends as the music fades out.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;
export const TRANSITION = 20;

export const SCENE_FRAMES = {
  opening: 180,
  bloom: 270,
  stone: 270,
  gold: 330,
  white: 240,
  finale: 180,
} as const;

const scenes = Object.values(SCENE_FRAMES);
export const FILM_FRAMES =
  scenes.reduce((sum, frames) => sum + frames, 0) -
  TRANSITION * (scenes.length - 1);
