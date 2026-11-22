// Paths that things travel along, as lists of points. A track measures its
// own length so a progress from 0 to 1 moves at an even speed.
export type Point = { readonly x: number; readonly y: number };

// The classic heart curve, starting and ending at the dip between the lobes
// and running clockwise through the right lobe first. `scale` is film pixels
// per unit; the curve is 32 units wide and about 29 tall.
export const heartCurve = (
  cx: number,
  cy: number,
  scale: number,
  steps = 160,
): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return { x: cx + x * scale, y: cy - y * scale };
  });

// Points along a cubic Bezier curve.
export const bezier = (
  a: Point,
  b: Point,
  c: Point,
  d: Point,
  steps = 40,
): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return {
      x:
        u * u * u * a.x +
        3 * u * u * t * b.x +
        3 * u * t * t * c.x +
        t * t * t * d.x,
      y:
        u * u * u * a.y +
        3 * u * u * t * b.y +
        3 * u * t * t * c.y +
        t * t * t * d.y,
    };
  });

export const toPath = (points: readonly Point[]) =>
  points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

export const makeTrack = (points: readonly Point[]) => {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = lengths[lengths.length - 1];

  const locate = (distance: number) => {
    const d = Math.min(total, Math.max(0, distance));
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < d) {
      i++;
    }
    const a = points[i - 1];
    const b = points[i];
    const k = (d - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1);
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, index: i };
  };

  // Where the traveller is at `progress`, and which way it faces in degrees,
  // smoothed over `smooth` pixels so it turns corners instead of snapping.
  const at = (progress: number, smooth = 14) => {
    const distance = Math.min(1, Math.max(0, progress)) * total;
    const here = locate(distance);
    const back = locate(distance - smooth);
    const ahead = locate(distance + smooth);
    return {
      x: here.x,
      y: here.y,
      angle: (Math.atan2(ahead.y - back.y, ahead.x - back.x) * 180) / Math.PI,
      index: here.index,
    };
  };

  // The part of the track between two progresses.
  const between = (from: number, to: number): Point[] => {
    if (to <= from) {
      return [];
    }
    const a = locate(from * total);
    const b = locate(to * total);
    return [
      { x: a.x, y: a.y },
      ...points.slice(a.index, b.index),
      { x: b.x, y: b.y },
    ];
  };

  // How far along the track, from 0 to 1, a distance in pixels is.
  const progressOf = (distance: number) => distance / total;

  // How far along the track, from 0 to 1, its point number `index` is.
  const progressAt = (index: number) => lengths[index] / total;

  return { total, at, between, progressOf, progressAt };
};

// Whether a point is inside a closed outline (even-odd rule).
export const inside = (point: Point, outline: readonly Point[]) => {
  let result = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i];
    const b = outline[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      result = !result;
    }
  }
  return result;
};

export const distance = (a: Point, b: Point) =>
  Math.hypot(b.x - a.x, b.y - a.y);

// A smooth curve through all the points (Catmull-Rom), and where in the
// returned list each of the given points ended up.
export const smoothThrough = (stops: readonly Point[], steps = 30) => {
  const points: Point[] = [stops[0]];
  const indices = [0];
  for (let i = 0; i < stops.length - 1; i++) {
    const p0 = stops[Math.max(0, i - 1)];
    const p1 = stops[i];
    const p2 = stops[i + 1];
    const p3 = stops[Math.min(stops.length - 1, i + 2)];
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b +
          (-a + c) * t +
          (2 * a - 5 * b + 4 * c - d) * t2 +
          (-a + 3 * b - 3 * c + d) * t3);
      points.push({
        x: f(p0.x, p1.x, p2.x, p3.x),
        y: f(p0.y, p1.y, p2.y, p3.y),
      });
    }
    indices.push(points.length - 1);
  }
  return { points, indices };
};
