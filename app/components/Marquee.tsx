"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

const SERVICES = ["Tartalomgyártás", "Marketing", "Fejlesztés"];

// doubled so one Row stays wider than the viewport and the loop never gaps
const ITEMS = [...SERVICES, ...SERVICES];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="display whitespace-nowrap px-6 text-[clamp(2.2rem,7vw,6rem)] uppercase tracking-tight text-bone">
            {item}
          </span>
          <span className="text-accent" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.6 8.8L23 6.2l-6.2 6.4L23 19l-8.4-2.6L12 24l-2.6-7.6L1 19l6.2-6.4L1 6.2l8.4 2.6z" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const base = 0.55;
      const tween = gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 24,
        repeat: -1,
      });
      tween.timeScale(base);

      let settle: ReturnType<typeof setTimeout>;
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(-7, 7, self.getVelocity() / 160);
          tween.timeScale(base + boost);
          clearTimeout(settle);
          settle = setTimeout(() => {
            gsap.to(tween, { timeScale: base, duration: 0.8, ease: "power2.out" });
          }, 90);
        },
      });

      return () => {
        clearTimeout(settle);
        st.kill();
        tween.kill();
      };
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border-y border-line py-7 sm:py-9"
    >
      <div ref={trackRef} className="flex w-max">
        <Row />
        <Row />
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
