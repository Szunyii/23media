"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../lib/sections";

const SOCIALS = ["Instagram", "LinkedIn", "Behance", "X / Twitter"];
const SITEMAP = [
  { id: "services", label: "Szolgáltatások" },
  { id: "work", label: "Munkáink" },
  { id: "process", label: "Folyamat" },
  { id: "manifesto", label: "Stúdió" },
];

function RotatingCTA() {
  return (
    <Magnetic strength={0.5}>
      <button
        onClick={() => (window.location.href = "mailto:hello@23media.studio")}
        data-cursor="köszönj be"
        className="group relative grid h-40 w-40 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 hover:scale-105 sm:h-48 sm:w-48"
        aria-label="Írj a 23media-nek"
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]"
        >
          <defs>
            <path
              id="cta-circle"
              d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
            />
          </defs>
          <text className="fill-ink font-mono text-[8.3px] uppercase tracking-[0.34em]">
            <textPath href="#cta-circle" startOffset="0%">
              Indítsunk projektet • Indítsunk projektet •
            </textPath>
          </text>
        </svg>
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="transition-transform duration-500 group-hover:rotate-45"
        >
          <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Magnetic>
  );
}

export default function Contact() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-contact-head] span > span", {
        yPercent: 115,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
      gsap.to("[data-wordmark]", {
        backgroundPositionX: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-wordmark]",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <footer id="contact" ref={ref} className="relative bg-ink pt-28 sm:pt-36">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-mono text-[11px] text-accent">(07)</span>
          <span className="eyebrow text-muted">Beszéljünk</span>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <h2
            data-contact-head
            className="display text-[clamp(2.6rem,8vw,8rem)] leading-[0.95]"
          >
            <span className="block overflow-hidden">
              <span className="block">Van egy márkád,</span>
            </span>
            <span className="block overflow-hidden">
              <span className="block">
                amit érdemes{" "}
                <span className="serif-italic text-accent">megmozgatni?</span>
              </span>
            </span>
          </h2>

          <div className="flex shrink-0 items-center gap-8">
            <RotatingCTA />
          </div>
        </div>

        {/* contact lines */}
        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-line py-12 sm:grid-cols-4">
          <div>
            <p className="eyebrow mb-4 text-muted">Email</p>
            <a
              href="mailto:hello@23media.studio"
              data-cursor=""
              className="group inline-block text-[15px] text-bone transition-colors hover:text-accent"
            >
              hello@23media.studio
              <span className="block h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
          <div>
            <p className="eyebrow mb-4 text-muted">Új megkeresés</p>
            <a
              href="tel:+10000000000"
              className="text-[15px] text-bone transition-colors hover:text-accent"
            >
              +1 (000) 23-MEDIA
            </a>
          </div>
          <div>
            <p className="eyebrow mb-4 text-muted">Oldaltérkép</p>
            <ul className="space-y-2">
              {SITEMAP.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToSection(l.id)}
                    data-cursor=""
                    className="text-[15px] text-bone-dim transition-colors hover:text-bone"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-muted">Közösségi</p>
            <ul className="space-y-2">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    data-cursor=""
                    className="text-[15px] text-bone-dim transition-colors hover:text-bone"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="overflow-hidden px-5 sm:px-8">
        <div
          data-wordmark
          className="display select-none bg-gradient-to-r from-bone via-bone to-accent bg-[length:200%_100%] bg-clip-text pb-4 text-center text-[23vw] leading-[0.8] text-transparent"
        >
          23media
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-5 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} 23media — Minden jog fenntartva</span>
          <span>Saját csapat tervezte és építette · Világszerte</span>
          <button
            onClick={() => scrollToSection("top")}
            data-cursor=""
            className="transition-colors hover:text-accent"
          >
            Vissza a tetejére ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
