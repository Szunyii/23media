"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "../lib/gsap";
import Magnetic from "./Magnetic";

/** Plain copy, or `{ hl }` for the self-awareness bits that get the marker. */
type Part = string | { hl: string };

// Client copy, in the order the work happens: the mentor work runs through
// everything, the discovery phase precedes content, strategy + scripts follow.
// The first pillar is the self-awareness one — its whole cell is the marker.
const PILLARS: { n: string; title: string; desc: Part[] }[] = [
  {
    n: "01",
    title: "Önismeret",
    desc: [
      "A munka során ",
      { hl: "önismereti mentor bevonásával" },
      " dolgozunk a lelki fejlődésen, és a személyes márkaépítés során felbukkanó elakadásokon.",
    ],
  },
  {
    n: "02",
    title: "Feltárás",
    desc: [
      "Ügyfeleink számára egy mély, feltáró szakasz előzi meg a tartalomgyártást. Ennek során felkutatjuk a védjegyeket, ",
      { hl: "a hiteles és önazonos kommunikációt" },
      " és az üzleti lehetőségeket.",
    ],
  },
  {
    n: "03",
    title: "Stratégia és script",
    desc: [
      "A márkaépítés során teljeskörű stratégiaalkotással és scriptírással dolgozunk.",
    ],
  },
];

// The bars of the "23" mark are sheared by 0.4 (≈22°); the ember leans with it.
const SHEAR_DEG = (Math.atan(0.4) * 180) / Math.PI;

// One curve for every settle in here: expo.out is the closest GSAP has to a
// critically damped spring — fast start, long soft landing, no overshoot.
const SETTLE = "expo.out";

/**
 * The flagship service. Same dark surface language as the services deck above
 * it, but framed in the accent and anchored by the one solid-yellow cell.
 *
 * Motion: the panel is scrubbed to the scroll — it scales up out of the depth
 * as it arrives, so it tracks the finger 1:1 and reverses for free. Its copy
 * materialises once (blur → sharp, a short rise), the pillar cards lift in
 * behind, and on a fine pointer the cards tilt toward the cursor with a
 * specular sheen, springing flat again on leave.
 */
export default function PersonalBranding() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);
      const panel = q("[data-pb-panel]")[0] as HTMLElement;
      const glow = q("[data-pb-glow]")[0] as HTMLElement;
      const cards = q("[data-pb-card]") as HTMLElement[];

      gsap.set(glow, { rotation: SHEAR_DEG });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // --- arrival: tied to the scroll, with a short lag so it settles like a
      // spring after the wheel stops. The section is the trigger because the
      // panel's own box is the thing being transformed. ----------------------
      gsap.fromTo(
        panel,
        { y: 72, scale: 0.92, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 96%",
            end: "top 42%",
            scrub: 0.5,
          },
        },
      );

      // --- copy comes into focus: blur lifts as it rises ----------------------
      const focus = (targets: string, trigger: string, start: string, blur: number, dist: number, stagger: number) =>
        gsap.fromTo(
          targets,
          { y: dist, opacity: 0, filter: `blur(${blur}px)` },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: SETTLE,
            stagger,
            clearProps: "filter",
            scrollTrigger: { trigger, start },
          },
        );
      focus("[data-pb-line]", "[data-pb-title]", "top 85%", 12, 28, 0.1);
      focus("[data-pb-lead]", "[data-pb-leads]", "top 88%", 8, 20, 0.08);
      focus("[data-pb-close]", "[data-pb-close]", "top 92%", 6, 16, 0);

      // --- the cards lift in as solid objects: no blur on a surface ---------
      gsap.fromTo(
        cards,
        { y: 44, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: SETTLE,
          stagger: 0.09,
          scrollTrigger: { trigger: "[data-pb-cards]", start: "top 88%" },
        },
      );

      // the marker strokes draw themselves once the copy is in view
      gsap.utils.toArray<HTMLElement>(".hl", sectionRef.current).forEach((el) => {
        gsap.fromTo(
          el,
          { "--hl": "0%" },
          {
            "--hl": "100%",
            duration: 0.9,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 78%" },
          },
        );
      });

      // ember drifts with the scroll like the hero's flow field
      gsap.fromTo(
        glow,
        { yPercent: -18 },
        {
          yPercent: 18,
          ease: "none",
          scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      // --- tilt: cards lean toward a fine pointer and a sheen follows it.
      // quickTo re-targets from the live value, so a fast cursor never snaps. --
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const offs = cards.map((card) => {
        const sheen = card.querySelector<HTMLElement>("[data-pb-sheen]")!;
        gsap.set(card, { transformPerspective: 1000 });
        gsap.set(sheen, { xPercent: -50, yPercent: -50 });
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.7, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.7, ease: "power3" });
        const sx = gsap.quickTo(sheen, "x", { duration: 0.5, ease: "power3" });
        const sy = gsap.quickTo(sheen, "y", { duration: 0.5, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 7);
          rx(-py * 7);
          sx(px * r.width);
          sy(py * r.height);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        return () => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => offs.forEach((off) => off());
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="personal-branding"
      ref={sectionRef}
      className="relative bg-ink px-3 pb-10 sm:px-5 sm:pb-16"
    >
      <div
        data-pb-panel
        className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[1.75rem] border border-accent/60 bg-ink-panel px-6 py-10 will-change-transform sm:rounded-[2.25rem] sm:px-10 sm:py-12 lg:px-14 lg:py-14"
      >
        {/* ember: a tilted ellipse of the accent, mostly off the top-right corner */}
        <span
          aria-hidden
          data-pb-glow
          className="pointer-events-none absolute -right-[18%] -top-[42%] h-[52vw] max-h-[620px] w-[86vw] max-w-[1040px] opacity-[0.14] will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse at center, #f5c518 0%, rgba(245,197,24,0.4) 28%, transparent 66%)",
          }}
        />

        <span className="relative inline-block rounded-full bg-accent px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
          Kiemelt szolgáltatás
        </span>

        <div className="relative mt-10 grid grid-cols-1 gap-8 sm:gap-x-4 lg:mt-12 lg:grid-cols-3 lg:items-end">
          <h2
            data-pb-title
            className="display text-[clamp(3.2rem,8.6vw,7.75rem)] leading-[0.88] lg:col-span-2"
          >
            <span data-pb-line className="block pb-[0.06em]">
              Personal
            </span>
            <span data-pb-line className="serif-italic block pb-[0.16em] font-normal text-accent">
              branding
            </span>
          </h2>

          <div data-pb-leads className="flex flex-col gap-4 lg:pb-4">
            <p
              data-pb-lead
              className="text-[clamp(1.3rem,1.6vw,1.45rem)] leading-[1.3] text-bone"
            >
              A mai kor egyik legerősebb médiaeszköze a személyes márkaépítés!
            </p>
            <p data-pb-lead className="text-base leading-relaxed text-bone-dim">
              A 23 Media ökoszisztémája egy teljeskörű szolgáltatás keretében képes
              megalkotni, megtervezni, kivitelezni és célba juttatni egy personal
              brandet.
            </p>
          </div>
        </div>

        <ol
          data-pb-cards
          className="relative mt-10 grid grid-cols-1 gap-3 sm:gap-4 lg:mt-14 lg:grid-cols-3"
        >
          {PILLARS.map((p, i) => {
            const marker = i === 0;
            return (
              <li
                key={p.n}
                data-pb-card
                className={`group relative overflow-hidden rounded-2xl will-change-transform ${
                  marker
                    ? "bg-accent text-ink"
                    : "border border-line bg-ink transition-colors duration-500 hover:border-accent/50"
                }`}
              >
                {/* specular highlight that rides under the pointer */}
                <span
                  aria-hidden
                  data-pb-sheen
                  className={`pointer-events-none absolute left-1/2 top-1/2 h-[170%] w-[170%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                    marker
                      ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28),transparent_55%)]"
                      : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.09),transparent_55%)]"
                  }`}
                />
                <div className="relative flex h-full flex-col p-6 sm:p-7">
                  <span
                    className={`font-mono text-[11px] tracking-[0.2em] ${
                      marker ? "text-ink/60" : "text-accent"
                    }`}
                  >
                    {p.n}
                  </span>
                  <h3 className="display mt-10 text-[clamp(1.6rem,2vw,1.9rem)] leading-[1.02] lg:mt-12">
                    {p.title}
                  </h3>
                  <p
                    className={`mt-3 text-[15px] leading-relaxed ${
                      marker ? "text-ink/80" : "text-bone-dim"
                    }`}
                  >
                    {p.desc.map((part) =>
                      typeof part === "string" ? (
                        part
                      ) : marker ? (
                        // already sitting on the marker — weight carries it
                        <strong key={part.hl} className="font-semibold text-ink">
                          {part.hl}
                        </strong>
                      ) : (
                        <mark key={part.hl} className="hl">
                          {part.hl}
                        </mark>
                      ),
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          data-pb-close
          className="relative mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:mt-10"
        >
          <p className="serif-italic max-w-md text-[clamp(1.4rem,1.8vw,1.7rem)] leading-tight text-bone">
            Hiteles és <span className="text-accent">önazonos</span> kommunikáció.
          </p>
          <Magnetic strength={0.4}>
            <Link
              href="/konzultacio"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink outline-none transition-[background-color,transform] duration-100 ease-out hover:bg-bone focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-ink-panel active:scale-[0.97]"
            >
              Beszéljünk a márkádról
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
