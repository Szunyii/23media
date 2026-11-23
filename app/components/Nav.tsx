"use client";

import { useEffect, useRef, useState } from "react";
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

/** Freeze the page under the open mobile menu. Lenis' `stop()` adds
 *  `lenis-stopped` (overflow: clip); the inline overflow covers the
 *  reduced-motion case, where there is no Lenis. A stopped Lenis ignores
 *  `scrollTo`, so unlock before scrolling to a section. */
function lockScroll(on: boolean) {
  const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
  if (on) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = on ? "hidden" : "";
}

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // While the mobile menu is open: page frozen, Escape closes (focus back on
  // the toggle), and growing past `lg` — where the toggle disappears — closes it.
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const wide = window.matchMedia("(min-width: 64rem)");
    const onWide = () => wide.matches && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      lockScroll(false);
    };
  }, [menuOpen]);

  const goFromMenu = (id: string) => {
    lockScroll(false);
    setMenuOpen(false);
    scrollToSection(id);
  };

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
    <>
      <header
        ref={ref}
        // A tap on the logo or the CTA while the menu is open closes it first,
        // unlocking scroll in the same event so the logo's scroll-to-top runs.
        onClickCapture={(e) => {
          if (!menuOpen) return;
          const t = e.target as Node;
          if (toggleRef.current?.contains(t) || menuRef.current?.contains(t)) return;
          lockScroll(false);
          setMenuOpen(false);
        }}
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

          <div className="flex items-center gap-2">
            <Magnetic strength={0.35}>
              <Link
                href="/konzultacio"
                // Phones share the bar with the menu toggle: tighter tracking
                // below sm keeps the label on one line at 360 px, and the
                // smallest phones (< 358 px) drop "Ingyenes".
                className={`group flex items-center gap-2 rounded-full border border-bone/20 font-mono text-[11px] uppercase tracking-[0.12em] text-bone transition-all duration-300 hover:border-accent hover:bg-accent hover:text-ink sm:tracking-[0.18em] ${
                  scrolled ? "px-4 py-2" : "px-4 py-2.5 sm:px-5"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent transition-colors group-hover:bg-ink" />
                <span>
                  <span className="max-[22.4rem]:hidden">Ingyenes </span>
                  konzultáció
                </span>
              </Link>
            </Magnetic>

            {/* Below lg the section links live in a drop-down; the toggle matches
                the CTA's height (39 px, 35 px in the pill) and turns into an X. */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
              className={`relative grid shrink-0 place-items-center rounded-full border transition-[width,height,border-color,background-color] duration-300 [-webkit-tap-highlight-color:transparent] lg:hidden ${
                scrolled ? "size-[35px]" : "size-[39px]"
              } ${menuOpen ? "border-bone/40 bg-bone/[0.06]" : "border-bone/20"}`}
            >
              <span
                aria-hidden
                className={`absolute h-[1.5px] w-4 rounded-full bg-bone transition-[translate,rotate] duration-300 ease-out-expo motion-reduce:transition-none ${
                  menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[3.5px]"
                }`}
              />
              <span
                aria-hidden
                className={`absolute h-[1.5px] w-4 rounded-full bg-bone transition-[translate,rotate] duration-300 ease-out-expo motion-reduce:transition-none ${
                  menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[3.5px]"
                }`}
              />
            </button>
          </div>

          {/* Mobile drop-down: the same four links, Personal Branding in the
              accent pill language of the desktop nav. Hidden with visibility so
              closed links drop out of the tab order. */}
          <nav
            ref={menuRef}
            id="mobile-menu"
            aria-label="Menü"
            className={`absolute top-full mt-2 origin-top rounded-[1.75rem] border border-bone/10 bg-ink-soft/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)] transition-[opacity,translate,scale,visibility] motion-reduce:transition-none lg:hidden ${
              scrolled ? "inset-x-0" : "inset-x-3 sm:inset-x-4"
            } ${
              menuOpen
                ? "visible translate-y-0 scale-100 opacity-100 duration-300 ease-out-expo"
                : "invisible -translate-y-2 scale-[0.98] opacity-0 duration-200 ease-in"
            }`}
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => goFromMenu(l.id)}
                    style={{ transitionDelay: menuOpen ? `${70 + i * 40}ms` : "0ms" }}
                    className={`flex w-full items-center justify-between rounded-[1.25rem] px-5 py-4 text-left transition-[opacity,translate,background-color] duration-300 ease-out-expo [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none ${
                      menuOpen ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"
                    } ${
                      l.featured
                        ? "bg-accent/[0.07] text-accent ring-1 ring-inset ring-accent/30 active:bg-accent/15"
                        : "text-bone active:bg-bone/[0.06]"
                    }`}
                  >
                    <span className="font-display text-[1.65rem] font-bold leading-none tracking-[-0.02em]">
                      {l.label}
                    </span>
                    <span
                      aria-hidden
                      className={`font-mono text-sm ${l.featured ? "text-accent" : "text-bone-dim"}`}
                    >
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Dims the page under the open menu; a tap outside closes it. Outside the
          header on purpose: GSAP leaves a transform on the header, which would
          make a `fixed` child size itself to the header instead of the screen. */}
      <div
        aria-hidden
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/75 transition-[opacity,visibility] duration-300 motion-reduce:transition-none lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />
    </>
  );
}
