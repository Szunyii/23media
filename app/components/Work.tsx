"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

type Project = {
  n: string;
  name: string;
  tags: string;
  year: string;
  metric: string;
  /** css background for the tile visual */
  bg: string;
  span: string;
};

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Helio",
    tags: "Márka · Web",
    year: "’25",
    metric: "+212% regisztráció",
    bg: "radial-gradient(120% 120% at 80% 0%, #f5c518 0%, #6b5410 32%, #12100a 64%, #0a0a0a 100%)",
    span: "md:col-span-7",
  },
  {
    n: "02",
    name: "Vantage",
    tags: "Tartalom · Hirdetés",
    year: "’24",
    metric: "4,1× ROAS",
    bg: "radial-gradient(120% 120% at 10% 100%, #2a2a2a 0%, #141414 40%, #0a0a0a 100%)",
    span: "md:col-span-5",
  },
  {
    n: "03",
    name: "Northwind",
    tags: "Web · Designrendszer",
    year: "’25",
    metric: "−38% lemorzsolódás",
    bg: "radial-gradient(120% 120% at 100% 100%, #3a3a3a 0%, #161616 45%, #0a0a0a 100%)",
    span: "md:col-span-5",
  },
  {
    n: "04",
    name: "Pulse",
    tags: "Közösségi · Film",
    year: "’24",
    metric: "61M megtekintés",
    bg: "radial-gradient(130% 130% at 20% 10%, #f5c518 0%, #4d3b0a 30%, #100e0a 62%, #0a0a0a 100%)",
    span: "md:col-span-7",
  },
];

function Tile({ p }: { p: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
      // gentle parallax on the inner visual
      gsap.to(ref.current?.querySelector("[data-visual]") ?? {}, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <a
      ref={ref}
      href="#contact"
      data-cursor="eset megtekintése"
      className={`group relative block overflow-hidden rounded-2xl border border-line ${p.span}`}
    >
      <div
        data-visual
        className="relative h-[46vh] w-full scale-105 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 sm:h-[58vh]"
        style={{ background: p.bg }}
      >
        {/* fine grid texture */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <span
          aria-hidden
          className="absolute right-5 top-4 font-mono text-[11px] tracking-[0.2em] text-bone/60"
        >
          {p.n} — {p.year}
        </span>
      </div>

      {/* caption */}
      <div className="flex items-end justify-between gap-4 px-5 py-5">
        <div>
          <h3 className="display text-[clamp(1.6rem,2.6vw,2.6rem)] leading-none">
            {p.name}
          </h3>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            {p.tags}
          </p>
        </div>
        <span className="mb-1 whitespace-nowrap rounded-full border border-accent/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
          {p.metric}
        </span>
      </div>

      {/* hover sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-y-full bg-accent/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
    </a>
  );
}

export default function Work() {
  return (
    <section
      id="work"
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[11px] text-accent">(03)</span>
            <span className="eyebrow text-muted">Válogatott munkák</span>
          </div>
          <h2 className="display max-w-[16ch] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1]">
            Bizonyíték, nem <span className="serif-italic text-accent">ígéret.</span>
          </h2>
        </div>
        <p className="max-w-xs text-[14px] leading-relaxed text-bone-dim">
          Néhány márka, amit segítettünk megmozgatni. Valódi munka, valódi
          számok — a többi NDA alatt van.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {PROJECTS.map((p) => (
          <Tile key={p.n} p={p} />
        ))}
      </div>
    </section>
  );
}
