"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

// word, isAccent
const WORDS: [string, boolean][] = [
  ["Nem", false], ["a", false], ["trendeket", false], ["kergetjük.", false],
  ["Mi", false], ["építjük", true], ["azokat", false], ["a", false],
  ["márkákat,", false], ["amik", false], ["diktálják", true], ["őket", false],
  ["—", false], ["stratégiát,", false], ["dizájnt", false], ["és", false],
  ["történetet", false], ["alakítva", false], ["valódi,", false], ["mérhető", false],
  ["lendületté.", true],
];

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const words = ref.current?.querySelectorAll<HTMLElement>("[data-w]");
      if (!words) return;
      gsap.set(words, { opacity: 0.16 });
      gsap.to(words, {
        opacity: 1,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "bottom 75%",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="manifesto"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-40"
    >
      <div className="mb-10 flex items-center gap-3">
        <span className="font-mono text-[11px] text-accent">(01)</span>
        <span className="eyebrow text-muted">A stúdió</span>
      </div>
      <p className="display max-w-[18ch] text-[clamp(2rem,5.4vw,4.6rem)] leading-[1.04] tracking-[-0.02em] sm:max-w-[24ch]">
        {WORDS.map(([w, accent], i) => (
          <span
            key={i}
            data-w
            className={`mr-[0.22em] inline-block ${accent ? "serif-italic text-accent" : ""}`}
          >
            {w}
          </span>
        ))}
      </p>
    </section>
  );
}
