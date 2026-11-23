"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "../lib/gsap";
import Magnetic from "./Magnetic";
import HeroLockup from "./HeroLockup";
import { scrollToSection } from "../lib/sections";
import { INTRO_SPEED, onIntroReady } from "../lib/intro";

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
      const tl = gsap.timeline({ paused: true }).timeScale(INTRO_SPEED);
      tl.to("[data-hero-eyebrow]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }).to(
        "[data-hero-fade]",
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
        },
        "-=0.4",
      );

      // clear the lower-left corner early: the lockup's flight path down to
      // the Manifesto crosses it
      gsap.fromTo(
        "[data-hero-out]",
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=300",
            scrub: true,
          },
        },
      );

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
      /* no overflow-hidden: the lockup leaves this section on scroll and
         travels down into the Manifesto text */
      className="relative flex min-h-[100svh] flex-col justify-between"
    >
      {/* no z-index here: a stacking context would trap the lockup below the
          Preloader curtain, and it has to play the intro above it */}
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-5 pb-10 pt-32 sm:px-8 sm:pt-36">
        {/* eyebrow */}
        <div
          data-hero-eyebrow
          className="flex translate-y-4 items-center gap-3 opacity-0"
        >
          <span className="h-px w-10 shrink-0 bg-accent max-[380px]:w-6" />
          {/* one line down to 360 px: tighter tracking on the narrowest phones
              (`!` because the unlayered .eyebrow rule outranks utilities) */}
          <span className="eyebrow text-bone-dim max-[380px]:tracking-[0.2em]!">
            Média <span className="normal-case">és</span> marketing ügynökség
          </span>
        </div>

        <h1 className="sr-only">23media — média és marketing ügynökség</h1>

        {/* brand lockup — performs the first-load intro, then keeps turning */}
        <HeroLockup />

        {/* bottom row */}
        <div
          data-hero-out
          className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between"
        >
          {/* slogan, not body copy: the site's statement voice (Bricolage medium,
              tight tracking, full bone) at a size that stays below the lockup */}
          <p
            data-hero-fade
            className="max-w-md translate-y-4 text-balance font-display text-[clamp(1.0625rem,1.25vw,1.25rem)] font-medium leading-snug tracking-tight text-bone opacity-0"
          >
            Tervezéstől a kivitelezésig, egy kézben!
          </p>

          {/* phones: two full-width rows, the arrow at the far edge — a pair of
              pills of different widths stacked on the left read as leftovers */}
          <div
            data-hero-fade
            className="flex translate-y-4 flex-col gap-3 opacity-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <Magnetic strength={0.4}>
              <Link
                href="/konzultacio"
                className="press group flex items-center justify-between gap-3 rounded-full bg-accent px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone sm:inline-flex sm:justify-start sm:py-3.5"
              >
                Ingyenes konzultáció
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button
                onClick={() => scrollToSection("work")}
                className="press w-full rounded-full border border-bone/20 px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone sm:w-auto sm:py-3.5"
              >
                Referenciák
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div data-hero-out>
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
      </div>
    </section>
  );
}
