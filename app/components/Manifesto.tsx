"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { MARK_PATH, MARK_VIEWBOX } from "../lib/mark";

type Token = { t: string; em?: boolean } | { logo: true } | { br: true };
const words = (s: string, em = false): Token[] =>
  s.split(" ").map((t) => ({ t, em }));

const LEAD = words("Az online kommunikáció olyan, mint egy");
const LEAD_EM = words("szimfonikus zenekar.", true);

const BODY: Token[][] = [
  [
    ...words("A"),
    { logo: true },
    ...words(
      "egy olyan ökoszisztémát alkotott meg, ahol minden szakértő egyetlen közös kottából olvas! Ha velünk fejlődsz, a teljes kommunikációd egy kézben lesz.",
    ),
  ],
  words("Nincsenek felesleges körök. Nincs kidobott idő és nézeteltérés."),
  [
    ...words("Minden szakértő egy irányba halad:"),
    { br: true },
    ...words("Brandet építünk & Pénzt termelünk neked!", true),
  ],
];

/** The hero lockup in miniature, set on the text baseline in place of the name. */
function InlineLogo() {
  return (
    // outer span is the mask (open above/below for the glyphs, shut at the
    // sides); the lockup slides in through its left edge
    <span
      role="img"
      aria-label="23 Media"
      className="mr-[0.22em] inline-block pr-[0.04em] align-baseline lg:motion-safe:hidden"
      style={{ clipPath: "inset(-25% 0 -25% 0)" }}
    >
      <span
        data-inline-logo
        className="inline-flex items-baseline whitespace-nowrap text-bone"
      >
        <svg
          viewBox={MARK_VIEWBOX}
          aria-hidden
          className="h-[0.74em] w-auto shrink-0 fill-current"
        >
          <path d={MARK_PATH} fillRule="evenodd" />
        </svg>
        <span
          aria-hidden
          className="ml-[0.14em] font-display font-extrabold tracking-[-0.045em]"
        >
          Media
        </span>
        <span
          data-inline-dot
          aria-hidden
          className="ml-[0.05em] inline-block size-[0.13em] rounded-full bg-accent"
        />
      </span>
    </span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      // Words light up as they are read: each block is scrubbed over its own
      // trip through the viewport, so the glow keeps pace with the eye.
      root.querySelectorAll<HTMLElement>("[data-lit]").forEach((block) => {
        const lit = block.querySelectorAll<HTMLElement>("[data-w]");
        gsap.set(lit, { opacity: 0.16 });
        gsap.to(lit, {
          opacity: 1,
          ease: "none",
          // each word takes four stagger steps to reach full, so the front is
          // a soft gradient a few words wide rather than a hard word-by-word edge
          duration: 1.6,
          stagger: 0.4,
          scrollTrigger: {
            trigger: block,
            // the front sits in the lower-middle band: text enters dim and is
            // fully lit by the time it rises to ~55-70% of the viewport, where
            // the eye actually reads, not at the bottom edge
            start: "top 80%",
            end: "bottom 60%",
            scrub: true,
          },
        });
      });

      // The name arrives as the logo itself: it slides into the line from
      // behind its own left edge, and the dot lands last.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const logo = root.querySelector<HTMLElement>("[data-inline-logo]");
      const dot = root.querySelector<HTMLElement>("[data-inline-dot]");
      if (!logo || !dot) return;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: logo,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          logo,
          { xPercent: -104 },
          { xPercent: 0, duration: 1.3, ease: "expo.out" },
        )
        .fromTo(
          dot,
          { scale: 0 },
          { scale: 1, duration: 0.5, ease: "back.out(2.4)" },
          "-=0.7",
        );
    },
    { scope: ref },
  );

  const renderTokens = (tokens: Token[]) =>
    tokens.map((tok, i) =>
      "br" in tok ? (
        <br key={i} />
      ) : "logo" in tok ? (
        <span key={i}>
          {/* Desktop: an empty gap, exactly the size of the settled hero
              lockup (HeroLockup sets the width) — the real logo flies down
              from the hero and lands here. Its bottom edge is its baseline. */}
          <span
            data-logo-slot
            role="img"
            aria-label="23 Media"
            className="mr-[0.24em] hidden h-[0.92em] w-[4.2em] align-baseline lg:motion-safe:inline-block"
          />
          <InlineLogo />
        </span>
      ) : (
        <span
          key={i}
          data-w
          className={`mr-[0.24em] inline-block ${tok.em ? "serif-italic" : ""}`}
        >
          {tok.t}
        </span>
      ),
    );

  return (
    <section
      id="manifesto"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-40"
    >
      {/* The statement sits right; the body runs down the left margin so the
          hero lockup has a clear path into its first line. */}
      <div className="grid gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-x-16">
        <p
          data-lit
          className="display text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[1.02] tracking-[-0.025em] text-accent lg:col-start-2 lg:row-start-1 lg:self-start"
        >
          {renderTokens([...LEAD, ...LEAD_EM])}
        </p>

        <div
          data-lit
          className="space-y-[0.9em] font-display text-[clamp(1.3rem,2.5vw,2.2rem)] font-medium leading-[1.28] tracking-[-0.015em] text-bone lg:col-start-1 lg:row-start-1 lg:pt-[4.5rem]"
        >
          {BODY.map((para, i) => (
            <p key={i}>{renderTokens(para)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
