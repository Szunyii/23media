"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "../lib/gsap";
import IndexChip from "./IndexChip";

/** Plain copy, or `{ hl }` for the self-awareness phrase that gets the marker. */
type Part = string | { hl: string };

const NAME = "Engi Ádám";
const ROLES = ["Marketinges", "Közgazdász", "Önismereti mentor"];
/** Placeholder in the clients' duotone style — swap for the real photo. */
const PORTRAIT = "/team/engi-adam.svg";

// The founder's letter, condensed to its argument: the pain, the answer, the
// one-score team, the invitation. The phrases are his; only the length changed.
const LEAD = {
  before: "Olyan ökoszisztémát alkottam, ahol a vállalkozók időt és ideget spórolnak — és közben ",
  accent: "végre valaki megérti őket.",
};

const LETTER: { lead?: string; body: Part[] }[] = [
  {
    lead: "Rengeteg vezető szenved a cégépítésben.",
    body: [
      " A hivatásukhoz értenek, a legjobbat adják — mégis attól szenvednek, hogy nincs idejük. Sem a családra, sem feltöltődni, és túl sok folyamat fut, amit senki nem tart egy kézben.",
    ],
  },
  {
    body: [
      "Marketingesként, közgazdászként és ",
      { hl: "önismereti mentorként" },
      " olyan teret hoztunk létre, ahol nem ciki elfáradni, nem gáz hibázni, és szabad megosztani, amit érzel. Őszintén dolgozunk együtt, minden nap egy közös célért.",
    ],
  },
  {
    body: [
      "Ehhez összehangolt csapat kell. Itt a marketinges nem köpköd a tartalomgyártóra, a webes nem rakja rá a telefont a hirdetéskezelőre — minden eszközt egy irányba húzunk, hogy a márkád épüljön és a bevételed nőjön.",
    ],
  },
];

const CLOSING =
  "Ha szeretnél egy csapatot, ahol nem kell száz felé rohangálnod, lehetsz őszinte, és közben gyönyörködhetsz a számokban — szívből ajánlom a 23 Media csapatát.";

const GRID = {
  backgroundImage:
    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
  backgroundSize: "40px 40px",
};

/**
 * The founder, alone. The name is set as a masthead that fills the column
 * edge to edge, and his letter to entrepreneurs runs beneath it, signed.
 */
export default function Founder() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // --- masthead: the name rises through its mask, the rule draws under
      // it, then the roles settle in ------------------------------------
      gsap
        .timeline({
          scrollTrigger: { trigger: "[data-f-head]", start: "top 82%", once: true },
        })
        .fromTo(
          "[data-f-name] > span",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.5, ease: "power4.out" },
          0,
        )
        .fromTo(
          "[data-f-rule]",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: "expo.out", transformOrigin: "0% 50%" },
          0.55,
        )
        .fromTo(
          "[data-f-role]",
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 },
          0.85,
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

      // --- the signature writes itself in, left to right -------------------
      gsap.fromTo(
        "[data-f-sign]",
        { clipPath: "inset(-20% 100% -20% 0)" },
        {
          clipPath: "inset(-20% 0% -20% 0)",
          duration: 1.3,
          ease: "power2.inOut",
          scrollTrigger: { trigger: "[data-f-sign]", start: "top 90%" },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section
      id="founder"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="mb-10 flex items-center gap-3 sm:mb-14">
        <span className="font-mono text-[11px] text-accent">(05)</span>
        <span className="eyebrow text-muted">Az alapító</span>
      </div>

      {/* masthead — sized in container units so the name always fills the column */}
      <div data-f-head className="[container-type:inline-size]">
        <h2
          data-f-name
          className="reveal-line display -my-[0.12em] whitespace-nowrap py-[0.12em] text-[19.8cqw]"
          style={{ lineHeight: 1 }}
        >
          <span>{NAME}</span>
        </h2>

        <div className="relative mt-6 h-px sm:mt-8">
          <span
            data-f-rule
            aria-hidden
            className="absolute inset-0 bg-bone/25 will-change-transform"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span data-f-role>
            <IndexChip n="Alapító" on className="uppercase" />
          </span>
          {ROLES.map((r, i) => (
            <span
              key={r}
              data-f-role
              className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim"
            >
              {i > 0 && <span aria-hidden className="hidden h-px w-5 bg-bone/20 sm:block" />}
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* the letter, with the portrait keeping pace beside it */}
      <div
        data-f-body
        className="mt-14 grid grid-cols-1 items-start gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-x-10"
      >
        <figure
          data-f-portrait
          className="group lg:sticky lg:top-28 lg:col-span-5"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-ink-soft">
            {/* oversized wrapper so the parallax never shows an edge */}
            <div data-f-parallax className="absolute inset-x-0 -inset-y-[6%]">
              <Image
                src={PORTRAIT}
                alt={`${NAME} portréja`}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[50%_28%] grayscale transition-[filter,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={GRID}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/80 to-transparent" />
            <figcaption className="absolute bottom-5 left-5 right-5 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
              <span>{NAME}</span>
              <span className="text-accent">23 Media</span>
            </figcaption>
          </div>
        </figure>

        <div className="lg:col-span-7 lg:pl-6 xl:pl-12">
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
                  ) : (
                    <mark key={j} className="hl">
                      {part.hl}
                    </mark>
                  ),
                )}
              </p>
            ))}
          </div>

          <p
            data-f-fade
            className="serif-italic mt-10 max-w-[34ch] border-l-2 border-accent pl-6 text-[clamp(1.3rem,1.8vw,1.7rem)] leading-[1.25] text-bone lg:mt-12"
          >
            {CLOSING}
          </p>

          <div data-f-fade className="mt-12 flex flex-wrap items-end gap-x-6 gap-y-2">
            <p
              data-f-sign
              className="serif-italic text-[clamp(2.4rem,4vw,3.8rem)] leading-none text-bone"
            >
              {NAME}
            </p>
            <span className="pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              alapító · 23 Media
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
