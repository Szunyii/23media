"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../lib/sections";
import { onIntroReady } from "../lib/intro";

type Seg = { t: string; accent?: boolean };
const HEAD_LINES: Seg[][] = [
  [{ t: "Építsd fel a" }],
  [
    { t: "saját ", accent: false },
    { t: "Branded.", accent: true },
  ],
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Deterministic start state so a StrictMode re-mount never leaves the
      // intro stuck hidden; CSS keeps these at opacity-0 to avoid a flash.
      gsap.set("[data-hero-eyebrow], [data-hero-fade]", { opacity: 0, y: 16 });

      // Built paused; the Preloader releases the intro as its curtain lifts so
      // the headline reveal isn't wasted behind the loader. A timeout is a
      // safety net in case the preloader never reports in.
      const tl = gsap.timeline({ paused: true });
      tl.to("[data-hero-eyebrow]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          "[data-hero-word]",
          {
            // start fully below the mask's lower edge so the reveal slides up
            // cleanly; the mask now has room for accents/descenders (see CSS),
            // so overflow can stay hidden — nothing pops in at the end.
            yPercent: 140,
            duration: 1.15,
            ease: "power4.out",
            stagger: 0.1,
          },
          "-=0.4",
        )
        .to(
          "[data-hero-fade]",
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
          },
          "-=0.7",
        );

      // subtle parallax drift of the headline as you scroll out
      gsap.to("[data-hero-head]", {
        yPercent: 18,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      const unsub = onIntroReady(() => tl.play());
      const fallback = window.setTimeout(() => tl.play(), 4000);
      return () => {
        unsub();
        clearTimeout(fallback);
      };
    },
    { scope: ref },
  );

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-5 pb-10 pt-32 sm:px-8 sm:pt-36">
        {/* eyebrow */}
        <div
          data-hero-eyebrow
          className="flex translate-y-4 items-center gap-3 opacity-0"
        >
          <span className="h-px w-10 bg-accent" />
          <span className="eyebrow text-bone-dim">
            23media — kreatív- és médiastúdió
          </span>
        </div>

        {/* headline */}
        <h1
          data-hero-head
          className="display max-w-[15ch] text-[clamp(2.7rem,9vw,9.2rem)]"
        >
          {HEAD_LINES.map((line, i) => (
            <span
              key={i}
              data-hero-mask
              /* padding gives the clip box room for accents (top) and
                 descenders (bottom); equal negative margins cancel it out so
                 the 0.92 line-height stays pixel-identical */
              className="mb-[-0.22em] mt-[-0.3em] block overflow-hidden pb-[0.22em] pt-[0.3em]"
            >
              <span data-hero-word className="block">
                {line.map((seg, j) =>
                  seg.accent ? (
                    <span key={j} className="serif-italic text-accent">
                      {seg.t}
                    </span>
                  ) : (
                    <span key={j}>{seg.t}</span>
                  ),
                )}
              </span>
            </span>
          ))}
        </h1>

        {/* bottom row */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p
            data-hero-fade
            className="max-w-md translate-y-4 text-balance text-[15px] leading-relaxed text-bone-dim opacity-0"
          >
            A 23media a márkád mögött — stratégiától a megjelenésig, egy
            csapatban.
          </p>

          <div
            data-hero-fade
            className="flex translate-y-4 items-center gap-4 opacity-0"
          >
            <Magnetic strength={0.4}>
              <button
                onClick={() => scrollToSection("contact")}
                data-cursor="beszéljünk"
                className="rounded-full bg-accent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone"
              >
                Indítsunk projektet
              </button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button
                onClick={() => scrollToSection("work")}
                data-cursor=""
                className="rounded-full border border-bone/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone"
              >
                Munkáink
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div
        data-hero-fade
        className="relative z-10 mx-auto mb-6 flex w-full max-w-[1600px] translate-y-4 items-center justify-between px-5 opacity-0 sm:px-8"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Est. 2025
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Görgess
          <span className="relative block h-7 w-px overflow-hidden bg-bone/20">
            <span className="absolute inset-0 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-accent" />
          </span>
        </span>
      </div>
    </section>
  );
}
