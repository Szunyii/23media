"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { releaseIntro } from "../lib/intro";

/**
 * First-load intro built from the brand mark's own components: bold horizontal
 * bars with rounded corners and a forward shear (skewX) that reads as "23".
 * The bars slide into place top→bottom, the accent dot pops, then the whole
 * curtain lifts away on a diagonal — handing off to the Hero intro via
 * `releaseIntro()` the instant it starts rising.
 */
type Seg = { x: number; w: number };
type Band = { row: number; dir: "l" | "r"; segs: Seg[] };

const BAND_H = 22; // band thickness
const PITCH = 27; // row-to-row distance (band + gap)
const SKEW = -15; // forward shear, degrees

// The mark reconstructed as six horizontal sheared bands. Per-row segment
// extents follow the logo's alternating left/right slashes — plus its diagonal
// top-right and bottom-left cuts — so it reads as the brand mark itself rather
// than clean digits. `dir` is the side each band slides in from.
const BANDS: Band[] = [
  { row: 0, dir: "l", segs: [{ x: 0, w: 118 }] }, // top — left block, open top-right
  { row: 1, dir: "r", segs: [{ x: 90, w: 110 }] }, // right block, slash on the left
  { row: 2, dir: "l", segs: [{ x: 0, w: 100 }, { x: 175, w: 25 }] }, // slash mid-right
  { row: 3, dir: "r", segs: [{ x: 0, w: 26 }, { x: 113, w: 87 }] }, // slash center-left
  { row: 4, dir: "l", segs: [{ x: 0, w: 117 }, { x: 172, w: 28 }] }, // slash lower-right
  { row: 5, dir: "r", segs: [{ x: 128, w: 72 }] }, // bottom — right foot, open bottom-left
];

export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        releaseIntro();
        setDone(true);
        return;
      }

      // Lock the page while the curtain is up; the overlay covers everything,
      // this just stops any momentum scroll bleeding through.
      document.documentElement.style.overflow = "hidden";

      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
          document.documentElement.style.overflow = "";
        },
      });

      tl.set("[data-bar]", { autoAlpha: 0 })
        .from("[data-bar]", {
          x: (_i, el) => ((el as HTMLElement).dataset.dir === "l" ? -180 : 180),
          autoAlpha: 0,
          duration: 0.75,
          ease: "power4.out",
          stagger: (_i, el) => Number((el as HTMLElement).dataset.row) * 0.09,
        })
        .from(
          "[data-dot]",
          {
            scale: 0,
            transformOrigin: "center",
            autoAlpha: 0,
            duration: 0.5,
            ease: "back.out(2.2)",
          },
          "-=0.2",
        )
        .to({}, { duration: 0.3 }) // brief hold on the finished mark
        .to(ref.current, {
          yPercent: -100,
          duration: 0.95,
          ease: "power4.inOut",
          // hand off to the Hero the moment the curtain begins to rise
          onStart: () => {
            releaseIntro();
            document.documentElement.style.overflow = "";
          },
        });

      // never leave the page locked if we get torn down mid-intro
      return () => {
        document.documentElement.style.overflow = "";
      };
    },
    { scope: ref },
  );

  if (done) return null;

  return (
    <div
      ref={ref}
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-ink"
    >
      <svg
        viewBox="-42 -8 248 172"
        className="w-[min(60vw,420px)]"
        fill="none"
      >
        <g transform={`skewX(${SKEW})`}>
          {BANDS.map((b) => (
            <g key={b.row} data-bar data-row={b.row} data-dir={b.dir}>
              {b.segs.map((s, j) => (
                <rect
                  key={j}
                  x={s.x}
                  y={b.row * PITCH}
                  width={s.w}
                  height={BAND_H}
                  rx={5}
                  fill="var(--color-bone, #f4f3ef)"
                />
              ))}
            </g>
          ))}
        </g>
        <circle data-dot cx={180} cy={150} r={10} fill="var(--color-accent, #f5c518)" />
      </svg>
    </div>
  );
}
