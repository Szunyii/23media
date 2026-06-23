"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor present across every section: a precise accent dot plus a
 * lagging ring that grows and shows a label over elements tagged with
 * `data-cursor` (value becomes the label, e.g. data-cursor="view").
 * Elements render hidden and only reveal on fine-pointer devices once the
 * pointer moves, so touch devices never see a stray dot.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const reveal = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;
    let active = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      reveal();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const hit = (e.target as HTMLElement)?.closest?.(
        "[data-cursor], a, button",
      ) as HTMLElement | null;
      const next = !!hit;
      const label = hit?.getAttribute("data-cursor") ?? "";
      if (next !== active) {
        active = next;
        ringRef.current?.classList.toggle("cursor-active", active);
      }
      if (labelRef.current) labelRef.current.textContent = label;
      ringRef.current?.classList.toggle("cursor-labeled", !!label);
      // when a label shows (magnetic CTAs), drop blend mode so it stays legible
      dotRef.current?.classList.toggle("cursor-labeled", !!label);
    };

    const render = () => {
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(render);
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };
    const onEnter = () => reveal();

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent opacity-0 mix-blend-difference transition-opacity duration-300"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[70] flex h-10 w-10 -ml-5 -mt-5 items-center justify-center rounded-full border border-bone/40 text-[9px] font-mono uppercase tracking-[0.2em] text-bone opacity-0 mix-blend-difference"
      >
        <span ref={labelRef} className="opacity-0" />
      </div>
      <style>{`
        .cursor-ring { transition: width .3s var(--ease-out-expo), height .3s var(--ease-out-expo), background-color .3s, border-color .3s, opacity .3s; }
        .cursor-ring.cursor-active { width: 4.5rem; height: 4.5rem; margin-left:-2.25rem; margin-top:-2.25rem; background: var(--color-accent); border-color: var(--color-accent); }
        .cursor-ring.cursor-active span { opacity: 1; transition: opacity .25s .05s; }
        /* labelled state = solid accent + readable text, no inversion */
        .cursor-labeled { mix-blend-mode: normal; }
      `}</style>
    </>
  );
}
