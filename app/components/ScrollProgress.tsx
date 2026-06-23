"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS, scrollToSection } from "../lib/sections";

/** Fixed vertical rail with section markers + an orange fill tracking page scroll. */
export default function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const activeIndex = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === active),
  );

  return (
    <nav
      aria-label="Szakaszok"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 md:flex"
    >
      <span className="font-mono text-[10px] tracking-[0.25em] text-muted">
        {String(activeIndex + 1).padStart(2, "0")}
        <span className="text-bone/30"> / {String(SECTIONS.length).padStart(2, "0")}</span>
      </span>

      <div className="relative flex flex-col items-end gap-5">
        {/* track + fill */}
        <div className="absolute right-[3px] top-1 bottom-1 w-px bg-bone/15">
          <div
            ref={fillRef}
            className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="group relative flex items-center gap-3"
              data-cursor=""
              aria-label={`Ugrás ide: ${s.label}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? "translate-x-0 text-bone opacity-100"
                    : "translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              >
                {s.label}
              </span>
              <span
                className={`relative z-10 block rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-2 w-2 bg-accent ring-4 ring-accent/15"
                    : "h-1.5 w-1.5 bg-bone/30 group-hover:bg-bone"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
