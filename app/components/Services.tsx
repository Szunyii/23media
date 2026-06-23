"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

const SERVICES = [
  {
    n: "01",
    title: "Márka és arculat",
    desc: "Névadás, arculati rendszerek, hangvétel és irányelvek, amitől összetéveszthetetlen leszel.",
    items: ["Névadás", "Arculati rendszerek", "Irányelvek", "Art direction"],
  },
  {
    n: "02",
    title: "Web és digitális",
    desc: "Weboldalak és termékélmények, amik konvertálnak és sokáig kitartanak.",
    items: ["Webdesign", "Fejlesztés", "Designrendszerek", "Mozgókép"],
  },
  {
    n: "03",
    title: "Tartalom és film",
    desc: "Történetalapú tartalom, ami minden feedben kivívja a figyelmet.",
    items: ["Fotó", "Film és mozgókép", "Kampányok", "Szerkesztőségi"],
  },
  {
    n: "04",
    title: "Hirdetés és növekedés",
    desc: "Teljes tölcséres médiavásárlás, ami a költést kamatozó növekedéssé alakítja.",
    items: ["Fizetett közösségi", "Keresés és PPC", "CRO", "Analitika"],
  },
  {
    n: "05",
    title: "Közösségi média",
    desc: "Folyamatos közösségimédia-jelenlét, ami kultúrát épít, nem csak tartalomnaptárt.",
    items: ["Stratégia", "Közösség", "Influenszer", "Riportok"],
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const amount = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + amount(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section id="services" ref={sectionRef} className="relative bg-ink">
      <div className="relative h-[100svh] overflow-hidden">
        {/* header strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-28 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-accent">(02)</span>
            <span className="eyebrow text-muted">Szolgáltatások</span>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted sm:block">
            Húzd az oldalt · görgess →
          </span>
        </div>

        {/* progress bar */}
        <div className="absolute inset-x-5 bottom-8 z-20 h-px bg-bone/15 sm:inset-x-8">
          <div
            ref={barRef}
            className="h-full origin-left bg-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* horizontal track */}
        <div
          ref={trackRef}
          className="flex h-full w-max items-center gap-5 pl-5 pr-[12vw] sm:gap-7 sm:pl-8"
        >
          {/* intro panel */}
          <div className="flex h-[62vh] w-[78vw] shrink-0 flex-col justify-end pb-4 sm:w-[44vw]">
            <h2 className="display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98]">
              Minden, ami a
              <br />
              növekedéshez kell,
              <br />
              <span className="serif-italic text-accent">egy helyen.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-bone-dim">
              Öt terület, egy csapat, nulla átadás-átvétel. Bekapcsolódunk ott,
              ahol szükséged van ránk — vagy visszük az egészet.
            </p>
          </div>

          {/* service cards */}
          {SERVICES.map((s) => (
            <article
              key={s.n}
              data-cursor=""
              className="group relative flex h-[62vh] w-[82vw] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-ink-soft p-7 transition-colors duration-500 hover:border-accent sm:w-[34vw] sm:p-9"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-10 select-none font-mono text-[12rem] leading-none text-bone/[0.03] transition-colors duration-500 group-hover:text-accent/10"
              >
                {s.n}
              </div>

              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
                  {s.n}
                </span>
                <span className="h-2 w-2 rounded-full bg-bone/20 transition-colors duration-500 group-hover:bg-accent" />
              </div>

              <div className="relative">
                <h3 className="display text-[clamp(1.9rem,3vw,2.9rem)] leading-[1.02]">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-bone-dim">
                  {s.desc}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim transition-colors duration-300 group-hover:border-bone/30"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
