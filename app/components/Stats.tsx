"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import SectionLabel from "./SectionLabel";
import { STATS } from "../lib/content";

/**
 * Every figure is a row of small 3D drums, one per digit, built on the prism
 * rig the hero lockup rolls its service words on. A drum starts on its blank
 * front face and spins down through the two digits below its own, so the
 * figure counts up into place; each face is lit by how squarely it faces the
 * reader. The drums land left to right, and a "+" tips in last as the closing
 * beat. Above the figure an accent line shoots across,
 * stays lit while the drums turn, then slides off to leave the rule; the label
 * rises out of a mask underneath. Cells that scroll into view together run one
 * after another; a cell that arrives alone runs at once.
 * The figures themselves live in lib/content.ts (STATS).
 */

/** A cell starts once its rule has climbed to 70% of the viewport height, so
 *  the whole figure and its label are in view while it plays. */
const ENTER_AT = "top 70%";
const CELL_STEP = 0.18; // cells entering together, one after another
const DRUMS_AT = 0.1; // the first drum sets off just behind the line
const DIGIT_STEP = 0.07; // drums of one figure, left to right
const LEADS = 2; // digits that roll past before the drum's own
const SPIN = 1.3; // the first drum's spin-down
const SPIN_GROW = 0.1; // each drum to the right turns a little longer
const SPIN_EASE = "power3.out";
const PLUS_AFTER = 0.45; // the "+" follows the last digit once that is readable
const PLUS_TURN = 0.9;
const LINE = 0.7; // the accent line (and the rule under it) crossing the cell
const LINE_OFF_AT = 0.9;
const LABEL_AT = 0.45;

/** The digits a drum shows on its way to `digit`: …, digit − 2, digit − 1. */
const leads = (digit: string) =>
  Array.from(
    { length: LEADS },
    (_, i) => (Number(digit) + 10 - LEADS + i) % 10,
  );

const FACE = "block opacity-0 [backface-visibility:hidden]";

/** One prism: its own glyph in flow, the lead digits stacked on top of it.
 *  GSAP folds the faces around the prism and turns it. */
function Drum({
  glyph,
  lead = [],
  plus = false,
}: {
  glyph: string;
  lead?: number[];
  plus?: boolean;
}) {
  return (
    <span
      data-drum={plus ? "plus" : "digit"}
      className={`relative inline-block ${plus ? "text-accent" : ""}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {lead.map((n) => (
        <span key={n} data-face className={`absolute left-1/2 top-0 ${FACE}`}>
          {n}
        </span>
      ))}
      <span data-face className={FACE}>
        {glyph}
      </span>
    </span>
  );
}

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
      gsap.set(gsap.utils.toArray<HTMLElement>("[data-face]", root), {
        autoAlpha: 0,
      });
      for (const cell of cells) {
        if (reduce) {
          gsap.set(part(cell, "[data-label]"), { autoAlpha: 0 });
          continue;
        }
        gsap.set(part(cell, "[data-label]"), { yPercent: 110 });
        gsap.set(part(cell, "[data-rule]"), { xPercent: -101 });
        gsap.set(part(cell, "[data-sweep]"), { xPercent: -101, autoAlpha: 1 });
      }

      /** Draw the line, spin the drums down onto the figure, raise the label. */
      const roll = contextSafe((cell: HTMLElement, delay: number) => {
        const drums = gsap.utils.toArray<HTMLElement>("[data-drum]", cell);
        const label = part(cell, "[data-label]");

        if (reduce) {
          // no movement: the figure and its label simply fade up
          gsap.to(
            [...drums.map((d) => d.lastElementChild as HTMLElement), label],
            { autoAlpha: 1, duration: 0.5, ease: "power2.out", delay },
          );
          return;
        }

        const tl = gsap.timeline({ delay });

        // the accent line crosses with the rule drawing in beneath it, then
        // slides off the far end once the figure is landing
        tl.to(
          part(cell, "[data-sweep]"),
          { xPercent: 0, duration: LINE, ease: "expo.out" },
          0,
        )
          .to(
            part(cell, "[data-rule]"),
            { xPercent: 0, duration: LINE, ease: "expo.out" },
            0.1,
          )
          .to(
            part(cell, "[data-sweep]"),
            { xPercent: 101, duration: 0.8, ease: "power3.inOut" },
            LINE_OFF_AT,
          );

        const digits = drums.filter((d) => d.dataset.drum === "digit").length;
        drums.forEach((drum, i) => {
          const faces = Array.from(drum.children) as HTMLElement[];
          const own = faces[faces.length - 1];
          const lead = faces.slice(0, -1);
          const plus = drum.dataset.drum === "plus";

          // every face turns about the prism's centre line: face k sits k
          // quarter-turns below the front, so the drum's own glyph is the
          // last one round and the bottom face is the first to come up
          const axis = `50% 50% ${-drum.offsetHeight / 2}px`;
          if (lead.length) gsap.set(lead, { xPercent: -50 });
          faces.forEach((face, k) =>
            gsap.set(face, { rotationX: -90 * (k + 1), transformOrigin: axis }),
          );
          gsap.set(drum, { transformOrigin: axis });

          // a face is lit by how squarely it faces the reader: full at the
          // front, dark by the time it has tipped away. The next digit glows
          // up as it arrives, and the one leaving does not linger as a sliver
          // over the figure through the slow end of the spin
          const light = () => {
            const turn = Number(gsap.getProperty(drum, "rotationX"));
            faces.forEach((face, k) => {
              const off = ((turn - 90 * (k + 1)) * Math.PI) / 180;
              gsap.set(face, { autoAlpha: Math.max(0, Math.cos(off)) ** 2 });
            });
          };

          const at = plus
            ? DRUMS_AT + (digits - 1) * DIGIT_STEP + PLUS_AFTER
            : DRUMS_AT + i * DIGIT_STEP;
          tl.fromTo(
            drum,
            { rotationX: 0 },
            {
              rotationX: 90 * faces.length,
              duration: plus ? PLUS_TURN : SPIN + i * SPIN_GROW,
              ease: plus ? "expo.out" : SPIN_EASE,
              onUpdate: light,
              onComplete: () => {
                // same picture, flat pose: no 3D layers left to soften the type
                if (lead.length) gsap.set(lead, { autoAlpha: 0 });
                gsap.set([drum, own], { clearProps: "transform" });
              },
            },
            at,
          );
        });

        tl.to(
          label,
          { yPercent: 0, duration: 0.9, ease: "expo.out" },
          LABEL_AT,
        );
      });

      ScrollTrigger.batch(cells, {
        start: ENTER_AT,
        once: true,
        onEnter: (batch) =>
          (batch as HTMLElement[]).forEach((cell, i) =>
            roll(cell, i * CELL_STEP),
          ),
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
        <SectionLabel className="mb-14">Számokban</SectionLabel>
        {/* phones: each figure and its label share one line, the label set
            against the right edge on the figure's baseline — a ledger row,
            where figure-over-label left the right half of the screen empty */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-3 sm:gap-y-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              data-stat
              className="relative pt-6 max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-6 sm:pt-5"
            >
              {/* the rule, and the accent line that draws it in */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 block h-px overflow-hidden"
              >
                <span data-rule className="absolute inset-0 bg-line" />
                <span
                  data-sweep
                  className="absolute inset-0 bg-accent opacity-0"
                />
              </span>
              <div className="display shrink-0 text-[clamp(3rem,6.6vw,7rem)] leading-none tracking-tight">
                <span className="sr-only">
                  {s.value}
                  {s.plus && "+"}
                </span>
                {/* shrink-wrapped, so the drums' vanishing point is the
                    middle of the figure rather than the middle of the cell */}
                <span
                  aria-hidden
                  className="inline-block whitespace-nowrap"
                  style={{ perspective: "7em" }}
                >
                  {[...s.value].map((digit, i) => (
                    <Drum key={i} glyph={digit} lead={leads(digit)} />
                  ))}
                  {s.plus && <Drum glyph="+" plus />}
                </span>
              </div>
              {/* the label carries real weight: same family as the figure,
                  a full step up from the mono eyebrows, in bone. It rises out
                  of a mask; the padding keeps the g/y descenders inside it. */}
              <p className="-mb-[0.15em] mt-4 overflow-hidden font-display text-[clamp(1.1rem,1.5vw,1.45rem)] font-medium leading-tight tracking-[-0.01em] text-bone max-sm:mt-0 max-sm:text-right">
                <span data-label className="block pb-[0.15em]">
                  {s.label}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
