"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "../lib/gsap";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../lib/sections";
import SectionLabel from "./SectionLabel";
import { ABOUT_LINKS, LEGAL_LINKS } from "./SiteLinks";
import { PAGES } from "../lib/site";

const SITEMAP = [
  { id: "services", label: "Szolgáltatások" },
  { id: "work", label: "Referenciák" },
];

function RotatingCTA() {
  return (
    <Magnetic strength={0.5}>
      {/* the section's main CTA leads to the consultation form, like every
          other CTA on the page; the e-mail address stays in the list below */}
      <Link
        href="/konzultacio"
        className="group relative grid h-40 w-40 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 hover:scale-105 active:scale-[0.96] active:duration-150 sm:h-48 sm:w-48"
        aria-label="Ingyenes konzultáció kérése"
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
      </Link>
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
    <footer id="contact" ref={ref} className="relative bg-ink pt-20 sm:pt-36">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <SectionLabel className="mb-6">Beszéljünk</SectionLabel>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <h2
            data-contact-head
            className="display text-[clamp(2.6rem,6.5vw,7.4rem)] leading-[0.95] [text-wrap:balance]"
          >
            {/* Size: the longest line ("Elindult benned valami", 10.66em) must fit
                beside the 192px CTA from the lg breakpoint up — 6.5vw clears it at
                1024 (709/720px) and the 7.4rem cap at the 1600px container.
                text-wrap:balance only matters on phones, where line 1 wraps: it
                gives "Elindult / benned valami" instead of orphaning "valami".
                Each line is masked (overflow-hidden) for the yPercent reveal, but the
                0.92 line-height box is shorter than the glyphs: Bricolage's inline box
                overshoots it by 0.14em, Instrument Serif italic's by 0.19em, so g/y
                descenders got chopped. The inner span pads the mask down by that much;
                the mask's equal negative margin keeps the line rhythm and h2 height. */}
            <span className="-mb-[0.14em] block overflow-hidden">
              <span className="block pb-[0.14em]">Elindult benned valami</span>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden">
              <span className="block pb-[0.14em]">és szeretnél róla</span>
            </span>
            <span className="-mb-[0.19em] block overflow-hidden">
              <span className="block pb-[0.19em]">
                <span className="serif-italic text-accent">beszélni?</span>
              </span>
            </span>
          </h2>

          <div className="flex shrink-0 items-center gap-8">
            <RotatingCTA />
          </div>
        </div>

        {/* contact lines (phone and socials were dropped — the client keeps
            both off the marketing pages). From lg up the sitemap is as wide as the CTA above it
            (w-48) and pushed to the same right edge, so the two start on one
            vertical; the legal links sit between. On phones e-mail and the
            sitemap share the first row, the legal links take the second. */}
        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-line py-12 lg:flex lg:justify-between">
          <div>
            <p className="eyebrow mb-4 text-muted">Email</p>
            <a
              href="mailto:23@23media.hu"
              className="group inline-block text-[15px] text-bone transition-colors hover:text-accent"
            >
              23@23media.hu
              <span className="block h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
          <div className="order-last col-span-2 lg:order-none lg:col-span-1">
            <p className="eyebrow mb-4 text-muted">Jogi információk</p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={PAGES[l.key].path}
                    rel={l.rel}
                    className="text-[15px] text-bone-dim transition-colors hover:text-bone"
                  >
                    {PAGES[l.key].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-48">
            <p className="eyebrow mb-4 text-muted">Oldaltérkép</p>
            <ul className="space-y-2">
              {SITEMAP.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToSection(l.id)}
                    className="text-[15px] text-bone-dim transition-colors hover:text-bone"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              {ABOUT_LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={PAGES[l.key].path}
                    rel={l.rel}
                    className="text-[15px] text-bone-dim transition-colors hover:text-bone"
                  >
                    {PAGES[l.key].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* giant wordmark — sized from its own box (24cqw: the word is 4.11em
          wide, so it fills 98.5% of the row at any gutter), where a vw size
          ran past the padding and lost its last letter on phones */}
      <div className="px-5 sm:px-8">
        <div className="@container overflow-hidden">
          <div
            data-wordmark
            className="display select-none bg-gradient-to-r from-bone via-bone to-accent bg-[length:200%_100%] bg-clip-text pb-4 text-center text-[24cqw] leading-[0.8] text-transparent"
          >
            23media
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-5 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} 23media — Minden jog fenntartva</span>
          <button
            onClick={() => scrollToSection("top")}
            className="transition-colors hover:text-accent"
          >
            Vissza a tetejére ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
