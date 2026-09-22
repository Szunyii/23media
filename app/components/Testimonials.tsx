"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import IndexChip from "./IndexChip";
import {
  GROUPS,
  type Testimonial,
  type TestimonialGroup,
} from "../lib/testimonials";

/** Quotes past this many characters collapse behind a "Tovább" toggle… */
const LONG = 280;
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

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

const GRID = {
  backgroundImage:
    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
  backgroundSize: "40px 40px",
};

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Gap between tiles in px — `gap-x-5` on the grid and `pb-5` on the cells must match. */
const GAP = 20;

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
        x > -GLOW_R && y > -GLOW_R && x < r.width + GLOW_R && y < r.height + GLOW_R;
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

/**
 * Packs the tiles like masonry: a 1px-row grid where every cell spans its
 * tile's height. Each tile is dealt to the shortest column once (on mount,
 * when the fonts land, and on resize), then its column is locked and only
 * the spans follow its height — so an unfolding quote slides the tiles
 * beneath it down instead of reshuffling the whole grid. Before JS runs it
 * is a plain grid.
 */
function Masonry({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const cells = Array.from(grid.children) as HTMLElement[];
    const refresh = gsap
      .delayedCall(0.2, () => ScrollTrigger.refresh())
      .pause();
    const height = (cell: HTMLElement) =>
      (cell.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
    const fit = (cell: HTMLElement) => {
      cell.style.gridRowEnd = `span ${height(cell) + GAP}`;
    };
    // deal every tile to the currently shortest column, in order
    const deal = () => {
      const n = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const tops = new Array<number>(n).fill(0);
      cells.forEach((cell) => {
        let c = 0;
        for (let i = 1; i < n; i++) if (tops[i] < tops[c]) c = i;
        cell.style.gridColumnStart = String(c + 1);
        tops[c] += height(cell) + GAP;
        fit(cell);
      });
    };
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) fit(e.target.parentElement as HTMLElement);
      refresh.restart(true);
    });
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(deal);
    };

    grid.style.gridAutoRows = "1px";
    grid.style.gridAutoFlow = "row dense";
    deal();
    const stopLight = spotlight(grid);
    cells.forEach((cell) => {
      if (cell.firstElementChild) ro.observe(cell.firstElementChild);
    });
    document.fonts?.ready.then(deal);
    window.addEventListener("resize", onResize);
    return () => {
      stopLight?.();
      ro.disconnect();
      refresh.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      grid.style.gridAutoRows = "";
      grid.style.gridAutoFlow = "";
      cells.forEach((cell) => {
        cell.style.gridRowEnd = "";
        cell.style.gridColumnStart = "";
      });
    };
  }, []);

  return (
    <div
      ref={ref}
      data-masonry
      className={`grid gap-x-5 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Logo({ t, className }: { t: Testimonial; className: string }) {
  if (!t.logo) return null;
  return (
    <Image
      src={t.logo}
      alt={`${t.name} logója`}
      width={240}
      height={64}
      className={`w-auto brightness-0 invert transition-opacity duration-500 ${className}`}
    />
  );
}

/** Portrait with the logo on a strip beneath it, or a logo-only well. */
function Visual({ t, personal }: { t: Testimonial; personal: boolean }) {
  if (!t.portrait) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-ink/70 ${
          personal ? "h-40 sm:h-full sm:min-h-[16rem]" : "h-36"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={GRID}
        />
        <Logo
          t={t}
          className="relative z-[2] h-9 max-w-[64%] opacity-75 group-hover:opacity-100 sm:h-10"
        />
      </div>
    );
  }

  return (
    // personal tiles: the column fills the tile, so a long quote makes the
    // portrait taller instead of leaving a gap under the logo strip
    <div className={personal ? "flex flex-col sm:h-full" : ""}>
      <div
        className={`relative z-[2] overflow-hidden bg-ink ${
          personal ? "aspect-[4/5] sm:min-h-0 sm:flex-auto" : "aspect-[4/3]"
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
                ? "(min-width: 1280px) 28vw, (min-width: 640px) 40vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover object-[50%_28%] grayscale transition-[filter,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={GRID}
        />
      </div>
      {t.logo && (
        <div
          className={`flex h-14 shrink-0 items-center justify-center border-t px-4 ${
            personal ? "border-accent/15 bg-ink/50" : "border-line bg-ink/50"
          }`}
        >
          <Logo
            t={t}
            className="relative z-[2] h-6 max-w-[72%] opacity-70 group-hover:opacity-100 sm:h-7"
          />
        </div>
      )}
    </div>
  );
}

/** The testimonial text. Long ones start folded to `LINES` lines; GSAP animates the fold. */
function Quote({ text, personal }: { text: string; personal: boolean }) {
  const id = useId();
  const long = text.length > LONG;
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
    gsap.fromTo(
      box,
      { height: box.offsetHeight, "--fade": next ? "3rem" : "0rem" },
      {
        height: next ? "auto" : line * LINES,
        "--fade": next ? "0rem" : "3rem",
        duration: reduced() ? 0 : 0.8,
        ease: "expo.out",
        overwrite: true,
        onComplete: () => {
          gsap.set(box, { clearProps: "height" });
          box.style.removeProperty("--fade");
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

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.from(ref.current, {
        y: 56,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
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
      className={`group relative overflow-hidden rounded-2xl border transition-colors duration-500 ${
        personal
          ? "border-accent/30 bg-ink-panel hover:border-accent/70"
          : "border-line bg-ink-soft hover:border-bone/25"
      }`}
    >
      <div
        className={
          personal
            ? "grid grid-cols-1 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            : "flex flex-col"
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
            {/* flagship tiles wear the sheared chip; company tiles get it
                stamped on hover (pulled left so the number stays on the margin) */}
            <IndexChip
              n={n}
              on={personal}
              className={personal ? "" : "-ml-3"}
            />
            <h3 className="display mt-5 text-[clamp(1.5rem,2vw,1.9rem)] leading-[1.02]">
              {t.name}
            </h3>
            <p
              className={`mt-2 font-mono text-[10px] uppercase tracking-[0.16em] ${
                personal ? "text-accent" : "text-muted"
              }`}
            >
              {t.role}
            </p>
          </div>

          <div className="relative mt-5 flex flex-col">
            <Quote text={t.quote} personal={personal} />
          </div>

          <div className="relative mt-auto pt-7">
            <a
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group/link inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] outline-none transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink focus-visible:border-accent ${
                personal
                  ? "border-accent/40 text-bone"
                  : "border-line text-bone-dim"
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
        </div>
      </div>
    </article>
  );
}

function Group({ g, first }: { g: TestimonialGroup; first: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const personal = g.id === "personal";

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.from("[data-g-rule]", {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
      gsap.from("[data-g-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={first ? "" : "mt-14 sm:mt-20"}>
      <div className="relative pb-6">
        <span
          data-g-rule
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px ${personal ? "bg-accent/60" : "bg-line"}`}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span
              data-g-reveal
              className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] ${
                personal
                  ? "bg-accent text-ink"
                  : "border border-line text-bone-dim"
              }`}
            >
              {g.label}
            </span>
            <p
              data-g-reveal
              className="serif-italic text-[clamp(1.35rem,2vw,1.9rem)] leading-tight text-bone"
            >
              {g.tagline}
            </p>
          </div>
          <span
            data-g-reveal
            className="font-mono text-[11px] tracking-[0.2em] text-muted"
          >
            {g.items.length} vélemény
          </span>
        </div>
      </div>

      <Masonry
        className={`mt-6 grid-cols-1 ${
          personal ? "xl:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {g.items.map((t, i) => (
          <div key={t.name} className="pb-5">
            <Tile
              t={t}
              n={String(i + 1).padStart(2, "0")}
              personal={personal}
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
}

/**
 * Client testimonials in two tiers. Personal brands come first on wide,
 * portrait-led editorial tiles in the flagship's warm panel tone; companies
 * follow on a denser grid of logo-led cards.
 */
export default function Testimonials() {
  return (
    <section
      id="work"
      className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[11px] text-accent">(03)</span>
            <span className="eyebrow text-muted">Ügyfeleink írták</span>
          </div>
          <h2 className="display max-w-[16ch] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1]">
            Ők mondják,{" "}
            <span className="serif-italic whitespace-nowrap text-accent">
              nem mi.
            </span>
          </h2>
        </div>
        <p className="max-w-xs text-[14px] leading-relaxed text-bone-dim">
          Portré, logó, és pár mondat azoktól, akikkel dolgozunk — a saját
          szavaikkal. Van, aki kettőt írt, van, aki tízet.
        </p>
      </div>

      {GROUPS.map((g, i) => (
        <Group key={g.id} g={g} first={i === 0} />
      ))}
    </section>
  );
}
