/**
 * The 23media brand mark ("23" built from sheared bars), traced from the
 * master artwork (23M_logo-04.png) into a single even-odd path.
 *
 * Coordinate space: 0 0 → 195.2 × 144.5. Every slanted edge shares the same
 * 0.4 shear (≈22°) and every corner is rounded with r = 1.4. The "2" and the
 * "3" are each three bars 26.2 units tall that overlap the other digit's bars
 * by 2.5 units — `MARK_BANDS` slices along those bar boundaries for the intro.
 */
export const MARK_W = 195.2;
export const MARK_H = 144.5;
export const MARK_VIEWBOX = `0 0 ${MARK_W} ${MARK_H}`;

export const MARK_PATH =
  "M0 1.4A1.4 1.4 0 0 1 1.4 0L73.9 0A1.4 1.4 0 0 1 75.2 0.88L83.98 22.82A1.4 1.4 0 0 0 85.28 23.7L193.8 23.7A1.4 1.4 0 0 1 195.2 25.1L195.2 143.1A1.4 1.4 0 0 1 193.8 144.5L130.8 144.5A1.4 1.4 0 0 1 129.5 143.62L120.72 121.68A1.4 1.4 0 0 0 119.42 120.8L1.4 120.8A1.4 1.4 0 0 1 0 119.4L0 48.7A1.4 1.4 0 0 1 1.4 47.3L88.9 47.3A1.4 1.4 0 0 0 90.2 45.38L82.88 27.08A1.4 1.4 0 0 0 81.58 26.2L1.4 26.2A1.4 1.4 0 0 1 0 24.8ZM102.9 70.12A1.4 1.4 0 0 0 104.2 71L167.6 71A1.4 1.4 0 0 0 169 69.6L169 51.3A1.4 1.4 0 0 0 167.6 49.9L96.88 49.9A1.4 1.4 0 0 0 95.58 51.82ZM26.2 93.2A1.4 1.4 0 0 0 27.6 94.6L107.82 94.6A1.4 1.4 0 0 0 109.12 92.68L101.8 74.38A1.4 1.4 0 0 0 100.5 73.5L27.6 73.5A1.4 1.4 0 0 0 26.2 74.9ZM121.78 117.32A1.4 1.4 0 0 0 123.08 118.2L167.6 118.2A1.4 1.4 0 0 0 169 116.8L169 98.6A1.4 1.4 0 0 0 167.6 97.2L115.8 97.2A1.4 1.4 0 0 0 114.5 99.12Z";

/** Horizontal slices at the bar boundaries — [yTop, yBottom) in mark units. */
export const MARK_BANDS: [number, number][] = [
  [0, 23.7], // "2" top bar
  [23.7, 49.9], // "3" top bar
  [49.9, 71], // "2" middle bar
  [71, 97.2], // "3" middle bar
  [97.2, 118.2], // "2" bottom bar
  [118.2, MARK_H], // "3" bottom bar
];

/** The bars' shear (0.4 ≈ 21.8°) as a CSS transform — chips and edges cut with the mark's slant. */
export const MARK_SHEAR = `skewX(-${((Math.atan(0.4) * 180) / Math.PI).toFixed(1)}deg)`;
