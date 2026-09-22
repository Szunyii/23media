"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { isIntroReleased, onIntroReady, releaseIntro } from "../lib/intro";

/**
 * First-load curtain. The brand intro itself is performed by the HeroLockup,
 * which plays *above* this layer and calls `releaseIntro()` once the mark is
 * assembled — that is the cue for the curtain to dissolve underneath it, so
 * the logo simply stays where it is while the hero appears around it.
 */
const SAFETY_MS = 5000;

export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  // already released → a remount (navigating back home), nothing to cover
  const [done, setDone] = useState(isIntroReleased);

  useGSAP(
    () => {
      if (!ref.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        releaseIntro();
        setDone(true);
        return;
      }

      // Lock the page while the curtain is up; the overlay covers everything,
      // this just stops any momentum scroll bleeding through. It stays locked
      // until the curtain is gone because the lockup rides above it (and above
      // the nav) for exactly that long.
      const unlock = () => {
        document.documentElement.style.overflow = "";
      };
      document.documentElement.style.overflow = "hidden";

      // Dissolve rather than slide: the curtain has no film grain on it, so a
      // moving edge reads as a dark sheet being pulled up behind the logo.
      const off = onIntroReady(() => {
        gsap.to(ref.current, {
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            unlock();
            setDone(true);
          },
        });
      });
      // never strand the visitor behind the curtain if the hero fails to report in
      const safety = window.setTimeout(releaseIntro, SAFETY_MS);

      // never leave the page locked if we get torn down mid-intro
      return () => {
        off();
        clearTimeout(safety);
        unlock();
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
      className="fixed inset-0 z-100 bg-ink"
    />
  );
}
