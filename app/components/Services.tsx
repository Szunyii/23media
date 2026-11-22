"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import SectionLabel from "./SectionLabel";
import { SERVICES, type HlPart } from "../lib/content";

// The copy lives in lib/content.ts (shared with the Markdown / llms.txt / MCP
// versions of the page).
const label = (p: HlPart) => (typeof p === "string" ? p : p.hl);

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track);
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const setX = gsap.quickSetter(track, "x", "px") as (v: number) => void;

      // `state.x` is the single source of truth for the track position: drag,
      // wheel and snap tweens all write it, the ticker below paints it.
      const state = { x: 0 };
      let centers: number[] = [];
      let snaps: number[] = [0];
      let step = 1;
      let vw = 0;
      let index = 0;
      let lastX = Number.NaN;
      let skew = 0;
      let dirty = true;

      const measure = () => {
        vw = viewport.clientWidth;
        centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
        snaps = centers.map((c) => vw / 2 - c);
        step = centers.length > 1 ? centers[1] - centers[0] : vw;
        dirty = true;
      };

      const min = () => snaps[snaps.length - 1];
      const max = () => snaps[0];
      const nearestSnap = (x: number) =>
        snaps.reduce(
          (best, s, i) =>
            Math.abs(s - x) < Math.abs(snaps[best] - x) ? i : best,
          0,
        );

      const go = (i: number) => {
        const n = gsap.utils.clamp(0, cards.length - 1, i);
        gsap.to(state, {
          x: snaps[n],
          duration: reduced ? 0 : 0.9,
          ease: "expo.out",
          overwrite: true,
        });
      };
      goRef.current = go;

      // Paint loop — cards scale/fade by distance from the stage centre and
      // lean with the track's velocity. Idles out when nothing moves.
      const render = () => {
        const v = Number.isNaN(lastX) ? 0 : state.x - lastX;
        if (!dirty && v === 0 && Math.abs(skew) < 0.01) return;
        dirty = false;
        lastX = state.x;
        skew +=
          ((reduced ? 0 : gsap.utils.clamp(-4, 4, v * 0.1)) - skew) * 0.14;
        setX(state.x);

        let nearest = 0;
        let best = Infinity;
        cards.forEach((card, i) => {
          const d = Math.abs(centers[i] + state.x - vw / 2);
          if (d < best) {
            best = d;
            nearest = i;
          }
          const t = Math.min(d / step, 1);
          gsap.set(card, {
            scale: 1 - 0.07 * t,
            opacity: 1 - 0.6 * t,
            skewX: skew,
          });
        });
        if (nearest !== index) {
          index = nearest;
          setActive(nearest);
        }
      };

      // --- drag -----------------------------------------------------------
      let dragging = false;
      let moved = false;
      let startX = 0;
      let startPos = 0;
      let startIndex = 0;
      let vel = 0; // px / ms
      let lastMoveX = 0;
      let lastMoveT = 0;

      const rubber = (x: number) =>
        x > max()
          ? max() + (x - max()) * 0.3
          : x < min()
            ? min() + (x - min()) * 0.3
            : x;

      const onDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragging = true;
        moved = false;
        startX = lastMoveX = e.clientX;
        lastMoveT = e.timeStamp;
        startPos = state.x;
        startIndex = index;
        vel = 0;
        gsap.killTweensOf(state);
      };

      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) {
          moved = true;
          viewport.setPointerCapture(e.pointerId);
          viewport.style.cursor = "grabbing";
        }
        if (!moved) return;
        state.x = rubber(startPos + dx);
        const dt = e.timeStamp - lastMoveT;
        if (dt > 0) vel = 0.8 * ((e.clientX - lastMoveX) / dt) + 0.2 * vel;
        lastMoveX = e.clientX;
        lastMoveT = e.timeStamp;
      };

      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        viewport.style.cursor = "";
        if (!moved) return go(index);
        if (e.timeStamp - lastMoveT > 80) vel = 0; // paused before letting go
        let n = nearestSnap(state.x + vel * 220);
        // a decisive flick always advances, even if it was short
        if (n === startIndex && Math.abs(vel) > 0.4)
          n = startIndex - Math.sign(vel);
        go(n);
      };

      // --- horizontal trackpad swipe ---------------------------------------
      let wheelTimer = 0;
      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        e.stopPropagation(); // keep Lenis out of it
        gsap.killTweensOf(state);
        state.x = gsap.utils.clamp(min(), max(), state.x - e.deltaX);
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => go(index), 140);
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") go(index + 1);
        else if (e.key === "ArrowLeft") go(index - 1);
        else if (e.key === "Home") go(0);
        else if (e.key === "End") go(cards.length - 1);
        else return;
        e.preventDefault();
      };

      const cardClicks = cards.map((_, i) => () => {
        if (!moved) go(i);
      });

      measure();
      state.x = snaps[0];

      const ro = new ResizeObserver(() => {
        if (viewport.clientWidth === vw) return;
        measure();
        gsap.killTweensOf(state);
        state.x = snaps[index];
      });
      ro.observe(viewport);

      viewport.addEventListener("pointerdown", onDown);
      viewport.addEventListener("pointermove", onMove);
      viewport.addEventListener("pointerup", onUp);
      viewport.addEventListener("pointercancel", onUp);
      viewport.addEventListener("wheel", onWheel, { passive: false });
      viewport.addEventListener("keydown", onKey);
      cards.forEach((c, i) => c.addEventListener("click", cardClicks[i]));
      gsap.ticker.add(render);

      if (!reduced) {
        gsap.from("[data-reveal]", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });
        // the deck glides in from the right — also hints that it moves sideways
        gsap.from(state, {
          x: snaps[0] + 360,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: { trigger: viewport, start: "top 80%", once: true },
        });
      }

      return () => {
        ro.disconnect();
        window.clearTimeout(wheelTimer);
        gsap.ticker.remove(render);
        gsap.killTweensOf(state);
        viewport.removeEventListener("pointerdown", onDown);
        viewport.removeEventListener("pointermove", onMove);
        viewport.removeEventListener("pointerup", onUp);
        viewport.removeEventListener("pointercancel", onUp);
        viewport.removeEventListener("wheel", onWheel);
        viewport.removeEventListener("keydown", onKey);
        cards.forEach((c, i) => c.removeEventListener("click", cardClicks[i]));
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative overflow-hidden bg-ink py-24 sm:py-28"
    >
      {/* header */}
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <div>
          <SectionLabel data-reveal className="mb-5">
            Szolgáltatások
          </SectionLabel>
          <h2
            data-reveal
            className="display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98]"
          >
            Minden, ami kell
            <br />
            az átütő kommunikációhoz,
            <br />
            <span className="serif-italic text-accent">egy helyen.</span>
          </h2>
        </div>
      </div>

      {/* draggable stage */}
      <div
        ref={viewportRef}
        tabIndex={0}
        role="group"
        aria-roledescription="karusszel"
        aria-label="Szolgáltatások — húzd, vagy használd a nyílbillentyűket"
        className="mt-3 cursor-grab touch-pan-y select-none py-6 outline-none focus-visible:ring-1 focus-visible:ring-accent/60 sm:mt-4"
      >
        <div
          ref={trackRef}
          className="relative flex w-max items-stretch gap-5 px-5 sm:gap-7"
        >
          {SERVICES.map((s, i) => (
            <article
              key={s.n}
              data-card
              className={`group relative flex min-h-[26rem] w-[82vw] max-w-[620px] shrink-0 flex-col justify-between gap-12 overflow-hidden rounded-2xl border bg-ink-soft p-7 transition-colors duration-500 will-change-transform sm:w-[58vw] sm:p-9 lg:w-[42vw] xl:w-[36vw] ${
                i === active ? "border-accent/70" : "border-line"
              }`}
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-6 -top-10 select-none font-mono text-[12rem] leading-none transition-colors duration-500 ${
                  i === active ? "text-accent/10" : "text-bone/[0.03]"
                }`}
              >
                {s.n}
              </div>

              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
                  {s.n}
                </span>
                <span
                  className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                    i === active ? "bg-accent" : "bg-bone/20"
                  }`}
                />
              </div>

              <div className="relative">
                <h3 className="display text-[clamp(1.9rem,3vw,2.9rem)] leading-[1.02]">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone-dim">
                  {s.desc.map((p) =>
                    typeof p === "string" ? (
                      p
                    ) : (
                      <mark key={p.hl} className="hl">
                        {p.hl}
                      </mark>
                    ),
                  )}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <li
                      key={label(it)}
                      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        typeof it === "string"
                          ? "border-line text-bone-dim"
                          : "border-accent bg-accent text-ink"
                      }`}
                    >
                      {label(it)}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* index + controls */}
      <div
        data-reveal
        className="mx-auto mt-6 flex max-w-[1600px] items-end gap-6 px-5 sm:px-8"
      >
        <div className="flex flex-1 gap-2">
          {SERVICES.map((s, i) => (
            <button
              key={s.n}
              type="button"
              onClick={() => goRef.current(i)}
              aria-current={i === active}
              aria-label={s.title}
              className="group/tab flex-1 cursor-pointer pt-3 text-left outline-none"
            >
              <span
                className={`block h-px transition-colors duration-500 group-focus-visible/tab:bg-bone ${
                  i === active
                    ? "bg-accent"
                    : "bg-bone/15 group-hover/tab:bg-bone/50"
                }`}
              />
              <span
                className={`mt-3 hidden font-mono text-[10px] uppercase leading-snug tracking-[0.14em] transition-colors duration-500 lg:block ${
                  i === active
                    ? "text-bone"
                    : "text-muted group-hover/tab:text-bone-dim"
                }`}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="mr-2 font-mono text-[11px] tracking-[0.2em] text-muted">
            <span className="text-bone">{SERVICES[active].n}</span> / 0
            {SERVICES.length}
          </span>
          {[-1, 1].map((dir) => {
            const disabled =
              dir < 0 ? active === 0 : active === SERVICES.length - 1;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => goRef.current(active + dir)}
                disabled={disabled}
                aria-label={
                  dir < 0 ? "Előző szolgáltatás" : "Következő szolgáltatás"
                }
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line text-bone outline-none transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink focus-visible:border-accent disabled:cursor-default disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-bone"
              >
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d={dir < 0 ? "M6 1 1 6l5 5M1 6h14" : "M10 1l5 5-5 5M15 6H1"}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
