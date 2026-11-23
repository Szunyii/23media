"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "../lib/gsap";
import SectionLabel from "./SectionLabel";
import Signature from "./Signature";
import { FOUNDER } from "../lib/content";

// Copy: lib/content.ts (FOUNDER) — the letter in his own words and order.
const { name: NAME, roles: ROLES, portrait: PORTRAIT, lead: LEAD, letter: LETTER, closing: CLOSING } =
  FOUNDER;

/**
 * The founder, alone. The section opens on its label; the portrait carries his
 * three roles beneath it, and his letter to entrepreneurs runs beside, signed.
 */
export default function Founder() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // --- roles: settle in under the portrait once the row is reached ------
      gsap.fromTo(
        "[data-f-role]",
        { y: 12, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-f-roles]", start: "top 94%", once: true },
        },
      );

      // --- portrait: rises in, then drifts with the scroll like the tiles ---
      gsap.from("[data-f-portrait]", {
        y: 40,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-f-body]", start: "top 85%" },
      });
      gsap.fromTo(
        "[data-f-parallax]",
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-f-body]",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // --- the letter: each block rises as it is reached ------------------
      gsap.utils.toArray<HTMLElement>("[data-f-fade]").forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // the marker draws itself once the phrase is in view
      gsap.utils.toArray<HTMLElement>(".hl", root).forEach((el) => {
        gsap.fromTo(
          el,
          { "--hl": "0%" },
          {
            "--hl": "100%",
            duration: 0.9,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 80%" },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="founder"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-28 sm:px-8 sm:py-36"
    >
      {/* the label is the section's whole opener, hence the larger cut */}
      <SectionLabel as="h2" size="lg" className="mb-10 sm:mb-14">
        Alapító
      </SectionLabel>

      {/* the letter, with the portrait keeping pace beside it */}
      <div
        data-f-body
        className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:gap-x-10"
      >
        <figure data-f-portrait className="lg:sticky lg:top-24">
          {/* while it is pinned, the frame gives up height on short screens so
              the roles under it stay in view. w-full pins it to the column:
              left to auto, the max-height would carry through the aspect
              ratio and narrow the frame, opening a gap beside the letter */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-ink-soft lg:max-h-[max(20rem,calc(100svh-9.75rem))]">
            {/* oversized wrapper so the parallax never shows an edge */}
            <div data-f-parallax className="absolute inset-x-0 -inset-y-[6%]">
              <Image
                src={PORTRAIT}
                alt={`${NAME} portréja`}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-[50%_28%] grayscale"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/80 to-transparent" />
            <figcaption className="absolute bottom-5 left-5 right-5 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
              <span>{NAME}</span>
              <span className="text-accent">23 Media</span>
            </figcaption>
          </div>

          {/* the rules between the roles drop out where the column is too
              narrow to hold all three on one line (lg up to xl) */}
          <div
            data-f-roles
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
          >
            {ROLES.map((r, i) => (
              <span
                key={r}
                data-f-role
                className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim"
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className="hidden h-px w-5 bg-bone/20 sm:block lg:hidden xl:block"
                  />
                )}
                {r}
              </span>
            ))}
          </div>
        </figure>

        <div className="min-w-0">
          <p data-f-fade className="eyebrow text-muted">
            Levél a vállalkozóknak
          </p>

          <p
            data-f-fade
            className="serif-italic mt-6 text-[clamp(1.65rem,2.9vw,2.8rem)] leading-[1.15] text-bone"
          >
            „{LEAD.before}
            <span className="text-accent">{LEAD.accent}</span>”
          </p>

          <div className="mt-10 max-w-[58ch] space-y-6 text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.65] text-bone-dim lg:mt-12">
            {LETTER.map((p, i) => (
              <p key={i} data-f-fade>
                {p.lead && (
                  <strong className="font-semibold text-bone">{p.lead}</strong>
                )}
                {p.body.map((part, j) =>
                  typeof part === "string" ? (
                    part
                  ) : "hl" in part ? (
                    <mark key={j} className="hl">
                      {part.hl}
                    </mark>
                  ) : (
                    <strong key={j} className="font-semibold text-bone">
                      {part.strong}
                    </strong>
                  ),
                )}
              </p>
            ))}
          </div>

          <p
            data-f-fade
            className="serif-italic mt-10 max-w-[34ch] text-balance border-l-2 border-accent pl-6 text-[clamp(1.3rem,1.8vw,1.7rem)] leading-[1.25] text-bone lg:mt-12"
          >
            {CLOSING}
          </p>

          {/* signed by hand — the scan writes itself in (see Signature) */}
          <div data-f-fade className="mt-12 flex flex-wrap items-end gap-x-6 gap-y-2">
            <Signature
              label={`${NAME} aláírása`}
              className="-mb-2 -ml-1 h-auto w-[clamp(15rem,24vw,22rem)] text-bone"
            />
            <span className="pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              alapító · 23 Media
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
