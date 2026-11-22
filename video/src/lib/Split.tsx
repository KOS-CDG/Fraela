import React from "react";

type Props = {
  readonly text: string;
  readonly className: string;
  readonly by?: "char" | "word";
  readonly style?: React.CSSProperties;
};

// Splits a line into inline-block spans, one per letter or word, so anime.js
// can move each one. The spans start hidden unless the style says otherwise.
export const Split: React.FC<Props> = ({
  text,
  className,
  by = "char",
  style,
}) => {
  const parts = by === "char" ? Array.from(text) : text.split(" ");
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <span
            className={className}
            style={{ display: "inline-block", opacity: 0, ...style }}
          >
            {part === " " ? " " : part}
          </span>
          {by === "word" && i < parts.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </>
  );
};
