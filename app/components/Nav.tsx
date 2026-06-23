"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import Logo from "./Logo";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../lib/sections";

const LINKS = [
  { id: "services", label: "Szolgáltatások" },
  { id: "work", label: "Munkáink" },
  { id: "process", label: "Folyamat" },
  { id: "team", label: "Csapat" },
];

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useGSAP(
    () => {
      // entrance
      gsap.from(ref.current, {
        yPercent: -120,
        opacity: 0,
        duration: 1.1,
        delay: 0.2,
        ease: "power3.out",
      });

      // hide on scroll-down, reveal on scroll-up
      let last = window.scrollY;
      const onScroll = () => {
        const y = window.scrollY;
        setHidden(y > last && y > 240);
        last = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    },
    { scope: ref },
  );

  return (
    <header
      ref={ref}
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToSection(l.id)}
              data-cursor=""
              className="group relative font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <Magnetic strength={0.35}>
          <button
            onClick={() => scrollToSection("contact")}
            data-cursor="köszönj be"
            className="group flex items-center gap-2 rounded-full border border-bone/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-accent hover:bg-accent hover:text-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent transition-colors group-hover:bg-ink" />
            Indítsunk projektet
          </button>
        </Magnetic>
      </div>
    </header>
  );
}
