"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

type Member = {
  n: string;
  name: string;
  role: string;
  /** discipline tag shown in the corner */
  tag: string;
  /** one-liner revealed on hover */
  focus: string;
  /** grayscale portrait-vignette gradient (duotone base) */
  bg: string;
};

const HEAD_GLOW =
  "radial-gradient(40% 32% at 50% 27%, rgba(255,255,255,0.16), transparent 72%)";

const MEMBERS: Member[] = [
  {
    n: "01",
    name: "Engi Ádám",
    role: "Alapító · Kreatív igazgató",
    tag: "Márka",
    focus: "„A jó márka nem hangosabb. Tisztább.”",
    bg: `${HEAD_GLOW}, radial-gradient(120% 110% at 42% 30%, #d2d0c9 0%, #74736b 27%, #34332d 58%, #151410 100%)`,
  },
  {
    n: "02",
    name: "Szabó Márton",
    role: "Stratégiai vezető",
    tag: "Stratégia",
    focus: "Pozicionálás, ami döntésre kényszerít.",
    bg: `${HEAD_GLOW}, radial-gradient(120% 110% at 60% 26%, #c4c2bb 0%, #6a6960 28%, #2f2e29 58%, #141310 100%)`,
  },
  {
    n: "03",
    name: "Tóth Nóra",
    role: "Design vezető",
    tag: "Design",
    focus: "A részletek nem dekorációk.",
    bg: `${HEAD_GLOW}, radial-gradient(120% 110% at 50% 24%, #d6d4cd 0%, #7a786f 26%, #38362f 56%, #161511 100%)`,
  },
  {
    n: "04",
    name: "Kovács Bence",
    role: "Növekedési vezető",
    tag: "Growth",
    focus: "Növekedés, amit vissza tudsz mérni.",
    bg: `${HEAD_GLOW}, radial-gradient(120% 110% at 34% 32%, #c0beb7 0%, #66655c 28%, #2c2b25 58%, #131210 100%)`,
  },
  {
    n: "05",
    name: "Varga Dániel",
    role: "Technikai vezető",
    tag: "Tech",
    focus: "Gyors oldalak, semmi felesleg.",
    bg: `${HEAD_GLOW}, radial-gradient(120% 110% at 68% 28%, #cdcbc4 0%, #706f66 27%, #333229 57%, #151410 100%)`,
  },
  {
    n: "06",
    name: "Nagy Réka",
    role: "Motion · Film",
    tag: "Motion",
    focus: "Mozgókép, ami megállítja a görgetést.",
    bg: `${HEAD_GLOW}, radial-gradient(120% 110% at 46% 26%, #dad8d1 0%, #7d7b72 25%, #3a382f 55%, #171612 100%)`,
  },
];

function Card({ m }: { m: Member }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%" },
      });
      // gentle parallax on the inner duotone visual
      gsap.to(ref.current?.querySelector("[data-visual]") ?? {}, {
        yPercent: -10,
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
    <article
      ref={ref}
      data-cursor={m.name}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-ink-soft"
    >
      {/* duotone portrait visual */}
      <div
        data-visual
        className="absolute inset-0 scale-110 grayscale transition-[filter,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.16] group-hover:grayscale-0"
        style={{ background: m.bg }}
      >
        {/* fine grid texture, matching the Work tiles */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* warm gold/amber duotone wash — colorizes the grayscale on hover */}
        <div
          className="absolute inset-0 opacity-0 mix-blend-color transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 110% at 50% 28%, #f5c518 0%, #c2510a 70%, #7a2f06 100%)",
          }}
        />
      </div>

      {/* legibility scrim */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/55 to-transparent" />

      {/* corner index + discipline */}
      <span
        aria-hidden
        className="absolute left-5 top-4 font-mono text-[11px] tracking-[0.2em] text-bone/55"
      >
        {m.n}
      </span>
      <span className="absolute right-4 top-4 rounded-full border border-bone/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/60 transition-colors duration-500 group-hover:border-accent/50 group-hover:text-accent">
        {m.tag}
      </span>

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="display text-[clamp(1.4rem,2.2vw,2rem)] leading-none">
          {m.name}
        </h3>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          {m.role}
        </p>

        {/* hover-revealed one-liner (smooth grid-rows height trick) */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="serif-italic mt-3 max-w-[28ch] text-[14px] leading-snug text-bone-dim">
              {m.focus}
            </p>
          </div>
        </div>
      </div>

      {/* hover sweep, mirrors the Work tiles */}
      <span className="pointer-events-none absolute inset-0 -translate-y-full bg-accent/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
    </article>
  );
}

export default function Team() {
  return (
    <section
      id="team"
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[11px] text-accent">(06)</span>
            <span className="eyebrow text-muted">Kik vagyunk</span>
          </div>
          <h2 className="display max-w-[16ch] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1]">
            Nem fiókszámok — <span className="serif-italic text-accent">emberek.</span>
          </h2>
        </div>
        <p className="max-w-xs text-[14px] leading-relaxed text-bone-dim">
          Hatan vagyunk, és mind a kezünket piszkítjuk. Nincs account manager,
          akin keresztül üzengetsz — azokkal dolgozol, akik a munkát is csinálják.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MEMBERS.map((m) => (
          <Card key={m.n} m={m} />
        ))}
      </div>
    </section>
  );
}
