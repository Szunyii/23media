"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

const STATS = [
  { prefix: "", value: 248, suffix: "", label: "Leszállított projekt" },
  { prefix: "+", value: 312, suffix: "%", label: "Átlagos növekedés" },
  { prefix: "$", value: 84, suffix: "M", label: "Kezelt médiaköltés" },
  { prefix: "", value: 19, suffix: "", label: "Szakmai díj" },
];

function Stat({ s, i }: { s: (typeof STATS)[number]; i: number }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: s.value,
        duration: 2.2,
        ease: "power3.out",
        delay: i * 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        onUpdate: () => {
          if (numRef.current) {
            numRef.current.textContent =
              s.prefix + Math.round(obj.v).toLocaleString() + s.suffix;
          }
        },
      });
      gsap.from(ref.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="border-t border-line pt-5">
      <div className="display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight">
        <span ref={numRef}>{s.prefix}0{s.suffix}</span>
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {s.label}
      </p>
    </div>
  );
}

export default function Stats() {
  return (
    <section
      id="stats"
      className="relative overflow-hidden bg-ink-soft py-28 sm:py-36"
    >
      {/* faint orange wash */}
      <div className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 bg-[radial-gradient(circle,_#f5c518_0%,_transparent_60%)] opacity-[0.07]" />
      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8">
        <div className="mb-14 flex items-center gap-3">
          <span className="font-mono text-[11px] text-accent">(04)</span>
          <span className="eyebrow text-muted">Számokban</span>
        </div>
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Stat key={s.label} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
