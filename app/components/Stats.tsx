"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

/**
 * Every figure sits on the front of a small 3D prism — the same rig the hero
 * lockup uses for its service words. It starts folded back on the prism's
 * bottom face and the prism tips 90° forward to bring it up into view, its
 * label settling in underneath. Cells that scroll into view together roll one
 * after another; a cell that arrives alone rolls at once.
 */
type Stat = {
  value: string;
  label: string;
  /** render an accent "+" after the figure */
  plus?: boolean;
};

const STATS: Stat[] = [
  { value: "20", plus: true, label: "Aktív ügyfél" },
  { value: "2300", plus: true, label: "Legyártott videó" },
  { value: "12", label: "Fős csapat" },
];

const TURN = 0.8; // one 90° tip of the prism, as in the hero
const TURN_EASE = "expo.inOut";
const STEP = 0.2; // cells rolling in one after another

export default function Stats() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe) return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-stat]", root);
      const part = (cell: HTMLElement, sel: string) =>
        cell.querySelector<HTMLElement>(sel) as HTMLElement;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // hidden until the cell scrolls in (CSS keeps the faces at opacity-0
      // so nothing flashes before this runs)
      for (const cell of cells) {
        gsap.set(part(cell, "[data-face]"), { autoAlpha: 0 });
        gsap.set(part(cell, "[data-label]"), {
          opacity: 0,
          y: reduce ? 0 : 10,
        });
      }

      /** Tip the prism so the figure (parked on the bottom face) becomes the front. */
      const roll = contextSafe((cell: HTMLElement, delay: number) => {
        const cube = part(cell, "[data-cube]");
        const face = part(cell, "[data-face]");
        const label = part(cell, "[data-label]");

        if (reduce) {
          gsap.to([face, label], {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            delay,
          });
          return;
        }

        const H = cube.offsetHeight;
        gsap.set(cube, {
          rotationX: 0,
          transformOrigin: `50% 50% ${-H / 2}px`,
        });
        // hinge the figure on the front-bottom edge, folded back 90°
        gsap.set(face, {
          y: H,
          rotationX: -90,
          transformOrigin: "50% 0%",
          autoAlpha: 0,
        });
        gsap
          .timeline({
            delay,
            onComplete: () => {
              // same picture, flat pose: no 3D layers left to soften the type
              gsap.set([cube, face], { clearProps: "transform" });
            },
          })
          .to(cube, { rotationX: 90, duration: TURN, ease: TURN_EASE }, 0)
          .to(
            face,
            { autoAlpha: 1, duration: TURN * 0.5, ease: "power2.out" },
            TURN * 0.3,
          )
          .to(
            label,
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            TURN * 0.5,
          );
      });

      ScrollTrigger.batch(cells, {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          (batch as HTMLElement[]).forEach((cell, i) => roll(cell, i * STEP)),
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="stats"
      ref={ref}
      className="relative overflow-hidden bg-ink-soft py-28 sm:py-36"
    >
      {/* faint accent wash */}
      <div className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 bg-[radial-gradient(circle,_#f5c518_0%,_transparent_60%)] opacity-[0.07]" />
      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8">
        <div className="mb-14 flex items-center gap-3">
          <span className="font-mono text-[11px] text-accent">(04)</span>
          <span className="eyebrow text-muted">Számokban</span>
        </div>
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} data-stat className="border-t border-line pt-5">
              <div
                className="display text-[clamp(3rem,6.6vw,7rem)] leading-none tracking-tight"
                style={{ perspective: "7em" }}
              >
                <div data-cube style={{ transformStyle: "preserve-3d" }}>
                  <span
                    data-face
                    className="block whitespace-nowrap opacity-0 [backface-visibility:hidden]"
                  >
                    {s.value}
                    {s.plus && <span className="text-accent">+</span>}
                  </span>
                </div>
              </div>
              {/* the label carries real weight: same family as the figure,
                  a full step up from the mono eyebrows, in bone */}
              <p
                data-label
                className="mt-4 font-display text-[clamp(1.1rem,1.5vw,1.45rem)] font-medium leading-tight tracking-[-0.01em] text-bone"
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
