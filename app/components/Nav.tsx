"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "../lib/gsap";
import Logo from "./Logo";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../lib/sections";
import { INTRO_SPEED, onIntroReady } from "../lib/intro";

// Page order. Personal Branding is the flagship offer, so it gets a soft
// accent pill instead of the plain mono link.
const LINKS = [
  { id: "services", label: "Szolgáltatások" },
  { id: "personal-branding", label: "Personal Branding", featured: true },
  { id: "work", label: "Referenciák" },
  { id: "founder", label: "Alapító" },
];

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // The nav stays in the top bar the whole time — no hide-on-scroll. The only
      // scroll reaction is the collapse-to-pill below. The entrance is held until
      // the preloader hands off (onIntroReady) so it is never racing the curtain
      // lift, which was the source of the intermittent black flash on load.
      //
      // Start hidden, then reveal once the intro is released. When we mount at the
      // top the pill background is transparent, so the nav can slide down cleanly.
      // If we mount already scrolled (Fast Refresh, restored scroll) the pill is
      // dark — sliding it down would drop a black bar in, so we just fade in place.
      // Read the position when the intro releases, not at mount — scroll
      // restoration can land after hydration.
      gsap.set(el, { autoAlpha: 0 });
      const off = onIntroReady(() => {
        if (window.scrollY > 80) {
          gsap.to(el, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
        } else {
          gsap.fromTo(
            el,
            { yPercent: -110 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1 / INTRO_SPEED,
              delay: 0.15 / INTRO_SPEED,
              ease: "power3.out",
            },
          );
        }
      });

      // Collapse to the pill purely from scroll position, with hysteresis so a
      // scroll position hovering right on the threshold can't flicker the dark
      // background on and off. Deferred to rAF to avoid setState in the effect body.
      //
      // The initial sync goes through the same `sync` as scroll events: on a reload
      // the browser's scroll restoration fires a scroll event that cancels the
      // pending frame, so a separate "set initial state" callback would be lost
      // and the nav would stay expanded over the content until the next threshold
      // crossing.
      let raf = 0;
      let collapsed = false;
      let synced = false;
      const sync = () => {
        const y = window.scrollY;
        if (!collapsed && y > 96) collapsed = true;
        else if (collapsed && y < 56) collapsed = false;
        else if (synced) return;
        synced = true;
        setScrolled(collapsed);
      };
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      raf = requestAnimationFrame(sync);

      return () => {
        off();
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
      };
    },
    { scope: ref },
  );

  return (
    <header
      ref={ref}
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ${
        scrolled ? "px-3 pt-3 sm:px-4" : "px-0 pt-0"
      }`}
    >
      <div
        className={`relative mx-auto flex items-center justify-between transition-[max-width,padding] duration-500 ${
          scrolled
            ? "max-w-240 px-4 py-2.5 sm:px-6"
            : "max-w-400 px-5 py-5 sm:px-8"
        }`}
      >
        {/* Surface layer fades separately from the width morph — a shared
            transition paints a full-width dark bar while collapsing/expanding */}
        <span
          aria-hidden
          className={`absolute inset-0 -z-10 rounded-full border border-bone/10 bg-ink-soft/95 shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition-[opacity,visibility] ${
            scrolled
              ? "visible opacity-100 delay-200 duration-300"
              : "invisible opacity-0 delay-0 duration-200"
          }`}
        />

        <Logo
          className={`origin-left transition-transform uppercase duration-500 ${
            scrolled ? "scale-[0.82]" : ""
          }`}
        />

        <nav
          className={`hidden items-center transition-[gap] duration-500 lg:flex ${
            scrolled ? "gap-7" : "gap-9"
          }`}
        >
          {LINKS.map((l) =>
            l.featured ? (
              <button
                key={l.id}
                onClick={() => scrollToSection(l.id)}
                className="-mx-1 rounded-full border border-accent/35 bg-accent/[0.07] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors duration-300 hover:border-accent/80 hover:bg-accent/15"
              >
                {l.label}
              </button>
            ) : (
              <button
                key={l.id}
                onClick={() => scrollToSection(l.id)}
                className="group relative font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </button>
            ),
          )}
        </nav>

        <Magnetic strength={0.35}>
          <Link
            href="/konzultacio"
            className={`group flex items-center gap-2 rounded-full border border-bone/20 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-all duration-300 hover:border-accent hover:bg-accent hover:text-ink ${
              scrolled ? "px-4 py-2" : "px-5 py-2.5"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent transition-colors group-hover:bg-ink" />
            Ingyenes konzultáció
          </Link>
        </Magnetic>
      </div>
    </header>
  );
}
