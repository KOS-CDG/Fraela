import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  readonly text: string;
  // Frame when the first word or letter starts to rise.
  readonly start: number;
  readonly by?: "word" | "letter";
  readonly stagger?: number;
  readonly duration?: number;
};

// Text that rises into place one word (or letter) at a time, each piece clipped
// by its own line box, like the headings on the 2026 page.
export const RiseText: React.FC<Props> = ({
  text,
  start,
  by = "word",
  stagger = 3,
  duration = 22,
}) => {
  const frame = useCurrentFrame();
  const pieces = by === "word" ? text.split(" ") : Array.from(text);

  return (
    <>
      {pieces.map((piece, i) => {
        const begin = start + i * stagger;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "top",
                padding: "0.06em 0.04em 0.14em",
                margin: "-0.06em -0.04em -0.14em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  translate: interpolate(
                    frame,
                    [begin, begin + duration],
                    ["0% 108%", "0% 0%"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                    },
                  ),
                }}
              >
                {piece}
              </span>
            </span>
            {by === "word" && i < pieces.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </>
  );
};
