"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsap";
import Grain from "./Grain";
import CustomCursor from "./CustomCursor";
import ScrollProgress from "./ScrollProgress";
import Preloader from "./Preloader";

/**
 * Site-wide chrome that spans every section:
 *  - Lenis smooth scroll, synced to the GSAP ticker so ScrollTrigger stays in step
 *  - animated film grain overlay
 *  - magnetic custom cursor
 *  - fixed scroll-progress rail with section markers
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Expose for anchor links / "back to top"
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return (
    // `cursor: none` is already scoped to fine-pointer devices in CSS,
    // so this class is safe to apply unconditionally.
    <div className="has-custom-cursor">
      <Preloader />
      <Grain />
      <CustomCursor />
      <ScrollProgress />
      {children}
    </div>
  );
}
