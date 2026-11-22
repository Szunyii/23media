"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import IndexChip from "./IndexChip";
import { GROUPS, type Testimonial } from "../lib/testimonials";
import SectionLabel from "./SectionLabel";

/**
 * Quotes past this many characters collapse behind a "Tovább" toggle. The
 * wide personal tiles have room for more before they fold, so a mid-length
 * quote stands whole there — and not every tile on the wall wears the toggle.
 */
const LONG = { personal: 420, company: 280 };
/** …to this many lines. `COLLAPSED` is LINES × the quote's line-height. */
const LINES = 4;
const LEADING = 1.55;
const COLLAPSED = "h-[6.2em] [--fade:3rem]";
/**
 * The fold's fade-out is a mask on the text itself, not a tile-coloured cover
 * painted over it, so the cursor light shows through the faded lines.
 * `--fade` is the mask's height: the collapsed class sets it, GSAP tweens it
 * inline with the fold.
 */
const FADE_MASK =
  "[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_var(--fade,0px)),transparent_100%)]";

/** The faint pool of light behind a logo, so dark marks don't sink into the well. */
const LIFT =
  "bg-[radial-gradient(closest-side,rgba(244,243,239,0.07),transparent)]";

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Seconds between two tiles' entrances — they come in one by one… */
const STEP = 0.18;
/** …but a tile never waits longer than this behind the queue (fast scrolls). */
const MAX_WAIT = 0.9;

/** Radius of the cursor light in px; `glowStyle` and the reach test share it. */
const GLOW_R = 170;

/** The light: a smooth falloff from the centre, gone at `GLOW_R`. Sits off-tile until painted. */
const glowStyle = (a: number): React.CSSProperties => ({
  background: `radial-gradient(${GLOW_R}px circle at var(--mx, -9999px) var(--my, -9999px), ${[
    [0, 1],
    [20, 0.8],
    [40, 0.52],
    [60, 0.28],
    [80, 0.1],
  ]
    .map(([stop, k]) => `rgba(245,197,24,${(a * k).toFixed(3)}) ${stop}%`)
    .join(", ")}, transparent 100%)`,
});

/**
 * One accent light for all the tiles of a grid. It trails the cursor in
 * viewport space and every tile paints the part of it that falls on its own
 * copy ground (`[data-glow]`, positioned through `--mx/--my` in the layer's
 * own coordinates) — so at an edge the glow runs on across the gap onto the
 * neighbour, while the gap itself stays dark. The layers are re-placed every
 * frame from their current rects, so when the page scrolls under a resting
 * cursor the light stays put on screen instead of riding off with the tile.
 * `data-lit` on the grid (cursor inside it) fades the layers in and out.
 * Fine pointers only.
 */
function spotlight(grid: HTMLElement) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const glows = gsap.utils.toArray<HTMLElement>("[data-glow]", grid);
  const drawn = new Map<HTMLElement, string>();
  const cursor = { x: NaN, y: NaN }; // where the pointer is
  const pos = { x: NaN, y: NaN }; // where the light is — it eases after the pointer
  const lag = reduced() ? 0 : 0.5;
  const xTo = gsap.quickTo(pos, "x", { duration: lag, ease: "power3" });
  const yTo = gsap.quickTo(pos, "y", { duration: lag, ease: "power3" });

  const paint = () => {
    if (Number.isNaN(pos.x)) return;
    const gr = grid.getBoundingClientRect();
    const inside =
      cursor.x >= gr.left &&
      cursor.x <= gr.right &&
      cursor.y >= gr.top &&
      cursor.y <= gr.bottom;
    if (grid.hasAttribute("data-lit") !== inside) {
      grid.toggleAttribute("data-lit", inside);
    }
    for (const g of glows) {
      const r = g.getBoundingClientRect();
      const x = pos.x - r.left;
      const y = pos.y - r.top;
      const near =
        x > -GLOW_R &&
        y > -GLOW_R &&
        x < r.width + GLOW_R &&
        y < r.height + GLOW_R;
      const at = near ? `${x.toFixed(1)},${y.toFixed(1)}` : "";
      if ((drawn.get(g) ?? "") === at) continue; // nothing moved: no repaint
      drawn.set(g, at);
      if (near) {
        g.style.setProperty("--mx", `${x}px`);
        g.style.setProperty("--my", `${y}px`);
      } else {
        // out of reach: back to the off-layer default
        g.style.removeProperty("--mx");
        g.style.removeProperty("--my");
      }
    }
  };

  const onMove = (e: PointerEvent) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    if (Number.isNaN(pos.x)) {
      xTo(e.clientX, e.clientX); // first sighting: start right under the pointer
      yTo(e.clientY, e.clientY);
    } else {
      xTo(e.clientX);
      yTo(e.clientY);
    }
  };
  // pointer left the window: nothing is under it any more
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) cursor.x = cursor.y = NaN;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerout", onOut);
  gsap.ticker.add(paint);
  return () => {
    gsap.ticker.remove(paint);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerout", onOut);
    grid.removeAttribute("data-lit");
  };
}

/* ------------------------------------------------------------------ */

type Kind = "personal" | "company";
type Cell = { t: Testimonial; kind: Kind };

/**
 * The reading order (and the phone's single column): the personal tiles
 * spread evenly among the company ones — P C C P C C…
 */
function mix(personal: Testimonial[], company: Testimonial[]): Cell[] {
  const per = personal.length
    ? Math.ceil(company.length / personal.length)
    : 0;
  const co = (list: Testimonial[]): Cell[] =>
    list.map((t) => ({ t, kind: "company" }));
  return [
    ...personal.flatMap((t, i): Cell[] => [
      { t, kind: "personal" },
      ...co(company.slice(i * per, (i + 1) * per)),
    ]),
    ...co(company.slice(personal.length * per)),
  ];
}

/**
 * Bubbles from a quote while its fold animates, so the wall can re-stack its
 * rows in the very frame the tile changes height. (Re-stacking from the
 * ResizeObserver alone would grow the page inside the observer callback,
 * which the browser reports as a "ResizeObserver loop" error every frame.)
 */
const RESTACK = "tile:restack";

/** Gap between tiles in px — must match the grid's `gap-x-5`. */
const GAP = 20;
/**
 * When the columns end within this many px of each other, the wall ends in
 * one line: the invite then opens a row of its own and spans it.
 */
const NEAR = 40;

/**
 * The wall: a masonry for both kinds of tile, where every tile keeps the
 * height its own content gives it — nothing is stretched to match a
 * neighbour, and an unfolding quote grows that tile alone, only sliding the
 * ones beneath it, as in an ordinary column.
 *
 * A personal tile is two columns wide, and a wide tile can only sit on two
 * columns that are level without leaving a hole. So the personal tiles stack
 * in a lane of their own (the left pair of columns), and the company tiles
 * are dealt to the shortest column: the rail beside the lane first, then
 * under it. The closing invite is one more small tile in the shortest
 * column — unless the wall ends in one line, where it would start a row by
 * itself: then it lies across that whole row as a thin bar.
 *
 * It is a 1px-row grid with every tile placed explicitly. Columns are dealt
 * on mount, when the fonts land and on resize, then locked; `place` only
 * re-stacks the rows as heights change. Before JS runs it is a plain grid.
 * One cursor light runs across all of it.
 */
function Wall({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const tiles = Array.from(grid.children) as HTMLElement[];
    const invite = tiles.find((t) => t.hasAttribute("data-invite"));
    const refresh = gsap
      .delayedCall(0.2, () => ScrollTrigger.refresh())
      .pause();
    type Slot = { el: HTMLElement; col: number; span: number };
    let slots: Slot[] = [];
    let cols = 1;
    const top = (tops: number[], col: number, span: number) =>
      Math.max(...tops.slice(col, col + span));

    // stack the rows from the tiles' current heights; columns stay as dealt
    const place = () => {
      const tops = new Array<number>(cols).fill(0);
      for (const { el, col, span } of slots) {
        const y = top(tops, col, span);
        const h = el.offsetHeight;
        el.style.gridRow = `${y + 1} / span ${h + GAP}`;
        tops.fill(y + h + GAP, col, col + span);
      }
    };

    const deal = () => {
      cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      tiles.forEach((t) => (t.style.minHeight = ""));
      const wide = (el: HTMLElement) =>
        cols > 1 && el.hasAttribute("data-wide");
      const rest = tiles.filter((t) => t !== invite);
      const lane = rest.filter(wide);
      const laneCols = lane.length ? 2 : 0; // the columns the lane owns
      const tops = new Array<number>(cols).fill(0);
      slots = [];

      // a tile's height depends on its width, so it is measured in its column
      const put = (el: HTMLElement, col: number, span: number) => {
        el.style.gridColumn = `${col + 1} / span ${span}`;
        slots.push({ el, col, span });
        tops.fill(
          top(tops, col, span) + el.offsetHeight + GAP,
          col,
          col + span,
        );
      };
      // the shortest column; level with the lane, the rail goes first
      const shortest = () => {
        let best = 0;
        for (let c = 1; c < cols; c++) {
          const rail = best < laneCols && c >= laneCols;
          if (tops[c] < tops[best] || (tops[c] === tops[best] && rail)) {
            best = c;
          }
        }
        return best;
      };

      lane.forEach((el) => put(el, 0, 2));
      rest.filter((el) => !wide(el)).forEach((el) => put(el, shortest(), 1));

      if (invite) {
        const foot = Math.max(...tops);
        if (foot - Math.min(...tops) <= NEAR) {
          // the wall ends in one line (the few px between the columns are
          // taken up by their last tiles): the invite gets the row to itself
          for (let c = 0; c < cols; c++) {
            const last = slots.findLast(
              (s) => c >= s.col && c < s.col + s.span,
            );
            if (!last || tops[c] === foot) continue;
            last.el.style.minHeight = `${last.el.offsetHeight + foot - tops[c]}px`;
            tops.fill(foot, last.col, last.col + last.span);
          }
          put(invite, 0, cols);
        } else {
          put(invite, shortest(), 1);
        }
      }
      place();
    };

    // Heights that change on their own (fonts, images) arrive here a frame
    // late, which is fine. A quote's fold is re-stacked from its own tween
    // instead (`RESTACK`), before the browser lays the frame out: by the
    // time this fires, nothing is left to move.
    const ro = new ResizeObserver(() => {
      place();
      refresh.restart(true);
    });
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(deal);
    };

    grid.style.gridAutoRows = "1px";
    grid.addEventListener(RESTACK, place);
    deal();
    const stopLight = spotlight(grid);
    tiles.forEach((t) => ro.observe(t));
    document.fonts?.ready.then(deal);
    window.addEventListener("resize", onResize);
    return () => {
      stopLight?.();
      ro.disconnect();
      refresh.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      grid.removeEventListener(RESTACK, place);
      grid.style.gridAutoRows = "";
      tiles.forEach((t) => {
        t.style.gridColumn = "";
        t.style.gridRow = "";
        t.style.minHeight = "";
      });
    };
  }, []);

  return (
    <div
      ref={ref}
      data-wall
      className="-mb-5 mt-6 grid grid-cols-1 items-start gap-x-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </div>
  );
}

/**
 * The client's logo in its own colours — or, until there is one, the company
 * name set as a wordmark in the display face. In a well the logo is sized by
 * its width, so its own proportions set the height: a square mark stands
 * taller than a wide one, and the tiles come out at different heights the
 * way their logos differ. On the strip under a portrait it is one line high.
 */
function Logo({ t, mode }: { t: Testimonial; mode: "well" | "strip" }) {
  if (!t.logo) {
    if (!t.company) return null;
    return (
      <span
        data-mark
        className={`display relative z-[2] max-w-[80%] text-center text-bone/80 transition-colors duration-500 group-hover:text-bone ${
          mode === "well" ? "text-[clamp(1.7rem,2.4vw,2.4rem)]" : "text-lg"
        }`}
      >
        {t.company}
      </span>
    );
  }
  // a wordmark gets more of the width than a mark, or it would end up tiny
  const wordmark = t.logo.width / t.logo.height >= 2.4;
  const zoom =
    "transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]";
  return (
    <span
      data-mark
      className={`relative z-[2] ${
        mode === "strip"
          ? "flex h-8 max-w-[72%] items-center"
          : `block ${wordmark ? "w-[62%]" : "w-[42%]"}`
      }`}
    >
      <Image
        src={t.logo}
        alt={`${t.company ?? t.name} logója`}
        sizes="(min-width: 640px) 280px, 60vw"
        className={`object-contain ${zoom} ${
          mode === "strip" ? "h-full w-auto" : "h-auto max-h-56 w-full"
        }`}
      />
    </span>
  );
}

/**
 * Portrait with the logo on a strip beneath it, or a logo-only well. Logos keep their
 * own colours on the dark ground, over a faint pool of light that lifts the
 * darker marks off it — so a logo needs its variant made for dark
 * backgrounds (MechaLearn: the mark alone, as on its own dark footer).
 */
function Visual({ t, personal }: { t: Testimonial; personal: boolean }) {
  if (!t.portrait) {
    const well = (
      <div
        data-well
        className={`relative flex items-center justify-center overflow-hidden bg-ink/70 ${
          personal
            ? // the same proportions as a portrait would have
              "aspect-[16/10] sm:aspect-[4/5] sm:min-h-0 sm:flex-auto"
            : // as tall as its logo asks for
              "min-h-36 flex-auto px-6 py-10"
        }`}
      >
        <div aria-hidden className={`absolute inset-0 ${LIFT}`} />
        <Logo t={t} mode="well" />
      </div>
    );
    return personal ? (
      <div className="flex flex-col sm:h-full">{well}</div>
    ) : (
      well
    );
  }

  return (
    // the column fills the tile, so a taller row makes the portrait taller
    // instead of leaving a gap under the logo strip
    <div className={`flex flex-col ${personal ? "sm:h-full" : "flex-auto"}`}>
      <div
        className={`relative z-[2] overflow-hidden bg-ink ${
          personal
            ? "aspect-[4/5] sm:min-h-0 sm:flex-auto"
            : "aspect-[4/3] flex-auto"
        }`}
      >
        {/* oversized wrapper so the scroll parallax never shows an edge */}
        <div data-parallax className="absolute inset-x-0 -inset-y-[6%]">
          <Image
            src={t.portrait}
            alt={`${t.name} portréja`}
            fill
            sizes={
              personal
                ? "(min-width: 1024px) 26vw, (min-width: 640px) 42vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover object-[50%_28%] grayscale transition-[filter,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        </div>
      </div>
      {(t.logo || t.company) && (
        <div
          className={`flex h-14 shrink-0 items-center justify-center border-t bg-ink/50 px-4 ${
            personal ? "border-accent/15" : "border-line"
          }`}
        >
          <Logo t={t} mode="strip" />
        </div>
      )}
    </div>
  );
}

/** The testimonial text. Long ones start folded to `LINES` lines; GSAP animates the fold. */
function Quote({ text, personal }: { text: string; personal: boolean }) {
  const id = useId();
  const long = text.length > (personal ? LONG.personal : LONG.company);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLQuoteElement>(null);

  const toggle = () => {
    const box = boxRef.current;
    if (!box) return;
    const next = !open;
    setOpen(next);
    // React only swaps the collapsed class; the inline height GSAP writes wins
    // during the tween and is cleared at the end so the class rules again.
    const line = parseFloat(getComputedStyle(box).fontSize) * LEADING;
    const restack = () =>
      box.dispatchEvent(new Event(RESTACK, { bubbles: true }));
    gsap.fromTo(
      box,
      { height: box.offsetHeight, "--fade": next ? "3rem" : "0rem" },
      {
        height: next ? "auto" : line * LINES,
        "--fade": next ? "0rem" : "3rem",
        duration: reduced() ? 0 : 0.8,
        ease: "expo.out",
        overwrite: true,
        // the wall re-stacks in the same frame (see `RESTACK`)
        onUpdate: restack,
        onComplete: () => {
          gsap.set(box, { clearProps: "height" });
          box.style.removeProperty("--fade");
          restack();
          ScrollTrigger.refresh();
        },
      },
    );
  };

  return (
    <>
      <div className="relative">
        <blockquote
          id={id}
          ref={boxRef}
          className={`overflow-hidden leading-[1.55] ${
            personal
              ? "serif-italic text-[clamp(1.1rem,1.3vw,1.3rem)] text-bone"
              : "text-[15px] text-bone-dim"
          } ${long ? FADE_MASK : ""} ${long && !open ? COLLAPSED : ""}`}
        >
          „{text}”
        </blockquote>
      </div>

      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={toggle}
          className="group/more mt-4 inline-flex cursor-pointer items-center gap-2.5 self-start font-mono text-[10px] uppercase tracking-[0.18em] text-accent outline-none"
        >
          <span
            aria-hidden
            className={`grid h-6 w-6 place-items-center rounded-full border border-accent/50 transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:bg-accent group-hover/more:text-ink group-focus-visible/more:bg-accent group-focus-visible/more:text-ink ${
              open ? "rotate-45" : ""
            }`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0v10M0 5h10"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </span>
          <span className="relative">
            {open ? "Kevesebb" : "Tovább"}
            <span
              aria-hidden
              className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:scale-x-100 group-focus-visible/more:scale-x-100"
            />
          </span>
        </button>
      )}
    </>
  );
}

function Tile({
  t,
  n,
  personal,
}: {
  t: Testimonial;
  n: string;
  personal: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  // the entrance belongs to the section (rows rise together); the tile only
  // drives its own portrait parallax
  useGSAP(
    () => {
      if (reduced()) return;
      const visual = ref.current?.querySelector("[data-parallax]");
      if (visual) {
        gsap.fromTo(
          visual,
          { yPercent: 4 },
          {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    },
    { scope: ref },
  );

  return (
    <article
      ref={ref}
      data-tile
      data-wide={personal ? "" : undefined}
      // a personal tile spans two columns; the legend's hover dims the other
      // kind through `filter`, as `opacity` belongs to the entrance tween
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-[border-color,filter] duration-500 ${
        personal
          ? "border-accent/30 bg-ink-panel hover:border-accent/70 sm:col-span-2 [[data-focus=company]_&]:[filter:opacity(0.25)]"
          : "border-line bg-ink-soft hover:border-bone/25 [[data-focus=personal]_&]:[filter:opacity(0.25)]"
      }`}
    >
      <div
        className={
          personal
            ? "grid flex-1 grid-cols-1 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] 2xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
            : "flex flex-1 flex-col"
        }
      >
        <Visual t={t} personal={personal} />

        <div
          className={`relative z-[2] flex flex-col p-6 sm:p-7 ${
            personal ? "sm:border-l sm:border-accent/15 lg:p-8" : ""
          }`}
        >
          {/* this tile's share of the grid's cursor light — only under the
              copy, never over the portrait or the logo */}
          <span
            aria-hidden
            data-glow
            className="pointer-events-none absolute inset-0 -z-[1] opacity-0 transition-opacity duration-500 [[data-lit]_&]:opacity-100"
            style={glowStyle(personal ? 0.24 : 0.18)}
          />

          {/* the big opening quote mark, same role as the giant index on the
              services deck; it lights up in the accent when the tile is hovered */}
          <span
            aria-hidden
            className={`serif-italic pointer-events-none absolute -top-3 right-5 select-none text-[6.5rem] leading-none transition-colors duration-700 ${
              personal
                ? "text-accent/15 group-hover:text-accent/35"
                : "text-bone/[0.05] group-hover:text-accent/[0.28]"
            }`}
          >
            „
          </span>

          <div className="relative">
            {/* flagship tiles wear the sheared chip, captioned with their kind
                now that they share the wall; company tiles get it stamped on
                hover (pulled left so the number stays on the margin) */}
            <div data-rise className="flex items-center gap-3">
              <IndexChip
                n={n}
                on={personal}
                className={personal ? "" : "-ml-3"}
              />
              {personal && (
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent/80">
                  Personal brand
                </span>
              )}
            </div>
            {personal ? (
              <>
                <h3
                  data-rise
                  className="display mt-5 text-[clamp(1.5rem,2vw,1.9rem)] leading-[1.02]"
                >
                  {t.name}
                </h3>
                {(t.role || t.company) && (
                  <p
                    data-rise
                    className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent"
                  >
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </>
            ) : (
              // company tiles lead with the company; the person signs below
              <>
                <h3
                  data-rise
                  className="display mt-5 text-[clamp(1.75rem,2.4vw,2.3rem)]"
                >
                  {t.company ?? t.name}
                </h3>
                {t.company && (
                  <p
                    data-rise
                    className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-bone"
                  >
                    <span aria-hidden className="h-px w-5 bg-accent/70" />
                    {t.name}
                    {t.role && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {t.role}
                      </span>
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          <div data-rise className="relative mt-5 flex flex-col">
            <Quote text={t.quote} personal={personal} />
          </div>

          {t.url && (
            <div data-rise className="relative mt-auto pt-7">
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/link inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] outline-none transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink focus-visible:border-accent ${
                  personal
                    ? "border-accent/40 text-bone"
                    : "border-bone/20 text-bone"
                }`}
              >
                {host(t.url)}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                >
                  ↗
                </span>
                <span className="sr-only">(új lapon nyílik)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** The legend keys: the group pills, which also spotlight their tiles on hover. */
function Legend({
  keys,
  total,
  onFocus,
}: {
  keys: { id: Kind; label: string; tagline: string; count: number }[];
  total: number;
  onFocus: (kind?: Kind) => void;
}) {
  return (
    <div data-legend className="relative pb-6">
      <span
        data-g-rule
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-accent/60 via-line to-line"
      />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10">
          {keys.map((k) => (
            <li
              key={k.id}
              data-g-reveal
              onPointerEnter={() => onFocus(k.id)}
              onPointerLeave={() => onFocus()}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span
                className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] ${
                  k.id === "personal"
                    ? "bg-accent text-ink"
                    : "border border-line text-bone-dim"
                }`}
              >
                {k.label}
                <span
                  className={k.id === "personal" ? "text-ink/55" : "text-muted"}
                >
                  {String(k.count).padStart(2, "0")}
                </span>
              </span>
              <span className="serif-italic text-[clamp(1.1rem,1.45vw,1.4rem)] leading-tight text-bone">
                {k.tagline}
              </span>
            </li>
          ))}
        </ul>
        <span
          data-g-reveal
          className="font-mono text-[11px] tracking-[0.2em] text-muted"
        >
          {total} vélemény
        </span>
      </div>
    </div>
  );
}

/**
 * The wall's closing tile: the slot where the next client's card will go,
 * drawn as an empty one (dashed frame, the next index on its chip) that
 * leads to the consultation. A small card in a column; laid out in one line
 * — a thin bar — when it has a whole row to itself (the container query).
 */
function Invite({ n }: { n: string }) {
  return (
    <Link
      href="/konzultacio"
      data-tile
      data-invite
      className="@container group relative block overflow-hidden rounded-2xl border border-dashed border-accent/35 outline-none transition-[border-color,filter] duration-500 hover:border-accent/80 focus-visible:border-accent [[data-focus]_&]:[filter:opacity(0.25)]"
    >
      <span
        aria-hidden
        data-glow
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [[data-lit]_&]:opacity-100"
        style={glowStyle(0.2)}
      />
      <span
        aria-hidden
        className="serif-italic pointer-events-none absolute -top-3 right-5 select-none text-[6.5rem] leading-none text-accent/10 transition-colors duration-700 group-hover:text-accent/35 @2xl:hidden"
      >
        „
      </span>

      <div className="relative flex flex-col items-start gap-5 p-6 sm:p-7 @2xl:flex-row @2xl:items-center @2xl:gap-8 @2xl:px-8 @2xl:py-6">
        <span data-rise>
          <IndexChip n={n} className="-ml-3 @2xl:ml-0" />
        </span>
        <p
          data-rise
          className="display text-[clamp(1.5rem,2vw,1.9rem)] @2xl:shrink-0"
        >
          Itt lehetne{" "}
          <span className="serif-italic whitespace-nowrap text-accent">
            a te neved.
          </span>
        </p>
        <p
          data-rise
          className="max-w-[34ch] text-[14px] leading-relaxed text-bone-dim"
        >
          Egy ingyenes konzultációval kezdődik — a véleményt később a saját
          szavaiddal írod meg.
        </p>
        <span
          data-rise
          className="mt-1 inline-flex shrink-0 items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink transition-colors duration-300 group-hover:bg-bone group-focus-visible:bg-bone @2xl:ml-auto @2xl:mt-0"
        >
          Ingyenes konzultáció
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/**
 * Client testimonials on one mixed wall. Personal brands keep their wide,
 * portrait-led editorial tiles in the flagship's warm panel tone, companies
 * their logo-led cards; the wide tiles and the company columns share one
 * masonry, and the legend above names the two kinds.
 */
export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const personal = GROUPS.find((g) => g.id === "personal");
  const company = GROUPS.find((g) => g.id === "company");
  const cells = mix(personal?.items ?? [], company?.items ?? []);

  // hovering a legend key dims the other kind of tile (attribute, not state:
  // nothing re-renders)
  const focus = (kind?: Kind) => {
    const el = ref.current;
    if (!el) return;
    if (kind) el.dataset.focus = kind;
    else delete el.dataset.focus;
  };

  useGSAP(
    () => {
      const calm = reduced();
      if (!calm) {
        const legend = { trigger: "[data-legend]", start: "top 85%" };
        gsap.from("[data-g-rule]", {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: legend,
        });
        gsap.from("[data-g-reveal]", {
          y: 24,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: legend,
        });
      }

      // The tiles arrive one at a time, in reading order. Each lands in
      // layers: the card rises and firms up, its picture settles from a
      // slight zoom, then the copy follows line by line and a personal
      // tile's chip is stamped on. Everything is cleared afterwards, so no
      // inline style outlives the entrance. (Nothing tweened here may carry
      // a CSS transition on the same property — it would smear the tween.)
      const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]");
      gsap.set(tiles, { autoAlpha: 0 });
      let free = 0; // ticker time at which the next tile may start
      const enter = (tile: HTMLElement) => {
        const now = gsap.ticker.time;
        const delay = Math.min(Math.max(0, free - now), MAX_WAIT);
        free = now + delay + STEP;
        const tl = gsap.timeline({ delay });
        if (calm) {
          // reduced motion: the same order, as a plain fade
          tl.fromTo(
            tile,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.5,
              ease: "power1.out",
              clearProps: "opacity,visibility",
            },
          );
          return;
        }
        const q = gsap.utils.selector(tile);
        tl.fromTo(
          tile,
          { y: 64, scale: 0.97, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 1.2,
            ease: "expo.out",
            clearProps: "transform,opacity,visibility",
          },
          0,
        )
          .fromTo(
            q("[data-parallax], [data-well] > [data-mark]"),
            { scale: 1.16 },
            { scale: 1, duration: 1.8, ease: "expo.out" },
            0,
          )
          .fromTo(
            q("[data-rise]"),
            { y: 18, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.07,
              clearProps: "transform,opacity,visibility",
            },
            0.2,
          )
          .fromTo(
            q("[data-chip-fill]"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.8,
              ease: "expo.out",
              clearProps: "clipPath",
            },
            0.32,
          );
      };
      ScrollTrigger.batch(tiles, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          (batch as HTMLElement[])
            .sort((a, b) => tiles.indexOf(a) - tiles.indexOf(b))
            .forEach(enter),
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="work"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="mb-14">
        <SectionLabel className="mb-4">Ügyfeleink írták</SectionLabel>
        <h2 className="display max-w-[16ch] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1]">
          POV:{" "}
          <span className="serif-italic whitespace-nowrap text-accent">
            minket választottál.
          </span>
        </h2>
      </div>

      <Legend
        keys={[personal, company].flatMap((g) =>
          g
            ? [
                {
                  id: g.id,
                  label: g.label,
                  tagline: g.tagline,
                  count: g.items.length,
                },
              ]
            : [],
        )}
        total={cells.length}
        onFocus={focus}
      />

      <Wall>
        {cells.map(({ t, kind }, i) => (
          <Tile
            key={t.name}
            t={t}
            n={String(i + 1).padStart(2, "0")}
            personal={kind === "personal"}
          />
        ))}
        <Invite n={String(cells.length + 1).padStart(2, "0")} />
      </Wall>
    </section>
  );
}
