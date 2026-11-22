import { createTimeline, type Timeline } from "animejs";
import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Remotion keeps the clock and anime.js does the moving. The timeline is built
 * once, paused, and sought to the current frame on every render, so any frame
 * can be rendered on its own and in any order.
 *
 * Two rules for the elements anime.js animates:
 * - give them their "before" look in CSS (opacity: 0, scale(0) and so on),
 *   matching the start of their first animation;
 * - never change their transform or opacity from React afterwards.
 */
export const useAnimeTimeline = <T extends Element = HTMLDivElement>(
  build: (tl: Timeline, root: T) => void,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const root = useRef<T>(null);
  const timeline = useRef<Timeline | null>(null);
  const builder = useRef(build);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const tl = createTimeline({ autoplay: false });
    builder.current(tl, element);
    timeline.current = tl;
    return () => {
      tl.revert();
      timeline.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    timeline.current?.seek((frame / fps) * 1000, true);
  }, [frame, fps]);

  return root;
};

export const all = (root: Element, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector));

export const one = (root: Element, selector: string) => {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`No element matches ${selector}`);
  }
  return element;
};

// Reads a number that a component stored on an element as data-*.
export const data = (key: string) => (target: unknown) =>
  Number((target as HTMLElement).dataset[key]);
