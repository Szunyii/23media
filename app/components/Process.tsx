"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";

const STEPS = [
  {
    n: "01",
    title: "Felfedezés",
    desc: "Beleássuk magunkat a piacodba, a közönségedbe és az adatokba, hogy megtaláljuk a valódi lehetőséget — nem a kézenfekvőt.",
  },
  {
    n: "02",
    title: "Meghatározás",
    desc: "Stratégia, pozicionálás és olyan kreatív alap, ami mögé az egész csapat felsorakozik.",
  },
  {
    n: "03",
    title: "Megalkotás",
    desc: "Tervezés, építés és gyártás szoros körökben — gyorsan, átláthatóan, és veled a szobában.",
  },
  {
    n: "04",
    title: "Növekedés",
    desc: "Indítás, mérés, optimalizálás. Maradunk, hogy az eredmények az indulás után is sokáig kamatozzanak.",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      steps.forEach((step) => {
        gsap.from(step, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 85%" },
        });
      });
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.index));
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sectionRef.current
      ?.querySelectorAll("[data-step]")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* sticky heading */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[11px] text-accent">(05)</span>
              <span className="eyebrow text-muted">Így dolgozunk</span>
            </div>
            <h2 className="display text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]">
              Folyamat, ami
              <br />
              <span className="serif-italic text-accent">lendületet ad.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-bone-dim">
              Négy fázis, semmi fekete doboz. Mindig tudod, mit csinálunk, miért,
              és mi a következő lépés.
            </p>
            <div className="mt-8 font-mono text-[11px] tracking-[0.2em] text-muted">
              <span className="text-accent">
                {String(active + 1).padStart(2, "0")}
              </span>{" "}
              / {String(STEPS.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* steps */}
        <div className="lg:col-span-7">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              data-step
              data-index={i}
              className="border-t border-line py-10 transition-colors duration-500 sm:py-14"
            >
              <div className="flex items-start gap-6">
                <span
                  className={`font-mono text-sm transition-colors duration-500 ${
                    active === i ? "text-accent" : "text-muted"
                  }`}
                >
                  {s.n}
                </span>
                <div>
                  <h3
                    className={`display text-[clamp(2rem,4vw,3.6rem)] leading-none transition-colors duration-500 ${
                      active === i ? "text-bone" : "text-bone/40"
                    }`}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone-dim">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
