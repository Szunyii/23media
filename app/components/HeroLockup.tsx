"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { isIntroReleased, releaseIntro } from "../lib/intro";
import {
  MARK_BANDS,
  MARK_H,
  MARK_PATH,
  MARK_VIEWBOX,
  MARK_W,
} from "../lib/mark";

/**
 * Hero centrepiece and first-load intro in one element: the "23" mark is
 * assembled from its six bands *above* the Preloader curtain, then slides left
 * as the first word rolls in beside it — so when the curtain lifts the logo is
 * already exactly where it lives, no hand-off between two copies.
 *
 * The word sits on a real 3D prism (depth = mark height) that tips 90° per
 * change: Marketing → Brand → Social → Develop → Media, once, then it stays on
 * "Media". The service words are
 * set in the serif italic, the last one in the display face — the offerings
 * resolve into the name, "23 Media.", with the accent dot as its full stop.
 *
 * On desktop the lockup then travels with the scroll: it shrinks and slides
 * down-left out of the hero into the `[data-logo-slot]` gap the Manifesto
 * leaves in its first sentence, and stays there as the name in the text.
 */
const WORDS = [
  { t: "Marketing" },
  { t: "Brand" },
  { t: "Social" },
  { t: "Develop" },
  { t: "Media", brand: true },
];
const LAST = WORDS.length - 1;

const PAD = 10;
// Adjacent clip windows overlap by a hair so antialiased edges of neighbouring
// slices don't leave a visible seam once the mark is assembled.
const SEAM = 0.6;

const TURN = 0.8; // one 90° tip of the prism
const TURN_EASE = "expo.inOut";
const HOLD = 0.85; // rest on a service word
const Z_ABOVE_CURTAIN = 110; // Preloader is z-100
// lockup geometry, in units of the mark height (--h)
const GAP = 0.2;
const DOT = 0.105;

const faceFont = (brand?: boolean): React.CSSProperties =>
  brand
    ? { fontSize: "calc(var(--h) * 0.98)" }
    : { fontSize: "calc(var(--h) * 1.14)" };
const faceClass = (brand?: boolean) =>
  brand ? "display tracking-[-0.045em]" : "serif-italic";

export default function HeroLockup() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const flight = q("[data-lockup-flight]")[0] as HTMLElement;
      const row = q("[data-lockup-row]")[0] as HTMLElement;
      const mark = q("[data-lockup-mark]")[0] as Element;
      const cube = q("[data-cube]")[0] as HTMLElement;
      const dot = q("[data-lockup-dot]")[0] as HTMLElement;
      const faces = q("[data-face]") as HTMLElement[];

      // dot rides just behind the current word, like a full stop
      const dotX = (i: number) => {
        const text = faces[i].querySelector("[data-face-text]") as HTMLElement;
        return text.offsetWidth + cube.offsetHeight * 0.07;
      };

      let current = LAST;
      let alive = true;
      let turning = false;
      let hurry = false; // scrolling has begun: cut straight to the name
      let pending: gsap.core.Tween | null = null;
      let active: gsap.core.Timeline | null = null;

      const showStatic = (i: number) => {
        current = i;
        gsap.set(faces, { autoAlpha: 0, y: 0, rotationX: 0 });
        gsap.set(faces[i], { autoAlpha: 1 });
        gsap.set(cube, { rotationX: 0 });
        gsap.set(dot, { x: dotX(i), autoAlpha: 1 });
      };

      /** Tip the prism so `to` (parked on the bottom face) becomes the front. */
      const turn = (to: number, from: number | null, onDone?: () => void) => {
        const H = cube.offsetHeight;
        turning = true;
        gsap.set(cube, {
          rotationX: 0,
          transformOrigin: `50% 50% ${-H / 2}px`,
        });
        // hinge the incoming face on the front-bottom edge, folded back 90°
        gsap.set(faces[to], {
          y: H,
          rotationX: -90,
          transformOrigin: "50% 0%",
          autoAlpha: 0,
        });
        const tl = gsap.timeline({
          onComplete: () => {
            // same picture, canonical pose: incoming face is the new front
            gsap.set(cube, { rotationX: 0 });
            gsap.set(faces[to], { y: 0, rotationX: 0 });
            current = to;
            turning = false;
            onDone?.();
          },
        });
        tl.to(cube, { rotationX: 90, duration: TURN, ease: TURN_EASE }, 0)
          // the full stop lifts off, and lands again once the new word has settled
          .to(dot, { scale: 0, duration: 0.28, ease: "power2.in" }, 0)
          .set(dot, { x: dotX(to) }, 0.3)
          .to(
            dot,
            { scale: 1, duration: 0.5, ease: "back.out(2.4)" },
            TURN * 0.74,
          )
          .to(
            faces[to],
            { autoAlpha: 1, duration: TURN * 0.5, ease: "power2.out" },
            TURN * 0.3,
          );
        if (from !== null) {
          // the face tipping away falls into shadow before it leaves
          tl.to(
            faces[from],
            { autoAlpha: 0, duration: TURN * 0.5, ease: "power2.in" },
            TURN * 0.12,
          );
        }
        return tl;
      };

      const schedule = () => {
        // the sequence plays once and comes to rest on the name
        if (!alive || pending || turning || current === LAST) return;
        pending = gsap.delayedCall(hurry ? 0 : HOLD, () => {
          pending = null;
          if (!alive) return;
          active = turn(hurry ? LAST : current + 1, current, schedule);
        });
      };
      // The lockup is about to leave for the Manifesto sentence, where it has
      // to read "23 Media." — skip whatever service words are still queued.
      const hurryToBrand = () => {
        if (hurry) return;
        hurry = true;
        if (current < 0) return; // intro: the page is locked, can't get here
        pending?.kill();
        pending = null;
        schedule();
      };

      const cleanups: (() => void)[] = [
        () => {
          alive = false;
          pending?.kill();
          active?.kill();
        },
      ];
      const cleanup = () => cleanups.forEach((fn) => fn());

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) {
        showStatic(LAST);
        return cleanup;
      }

      const section = root.closest("section");
      const mm = gsap.matchMedia();
      cleanups.push(() => mm.revert());

      // desktop: fly into the gap the Manifesto keeps open for the name
      mm.add("(min-width: 1024px)", () => {
        const slot = document.querySelector<HTMLElement>("[data-logo-slot]");
        if (!slot) return;
        // layout-space position — unlike getBoundingClientRect it ignores the
        // transform we are busy animating, so re-measuring mid-flight is safe
        const docPos = (el: HTMLElement) => {
          let x = 0;
          let y = 0;
          for (
            let e: HTMLElement | null = el;
            e;
            e = e.offsetParent as HTMLElement | null
          ) {
            x += e.offsetLeft;
            y += e.offsetTop;
          }
          return { x, y };
        };
        const measure = () => {
          const h = flight.offsetHeight;
          const s = slot.offsetHeight / h;
          // the slot is only as wide as the settled lockup: mark + "Media" + dot
          const visible = h * (MARK_W / MARK_H + GAP + DOT) + dotX(LAST);
          slot.style.width = `${visible * s}px`;
          const from = docPos(flight);
          const to = docPos(slot);
          return {
            s,
            x: to.x - from.x,
            y: to.y + slot.offsetHeight - (from.y + h),
          };
        };
        let m = measure();
        gsap.set(flight, { transformOrigin: "0% 100%" }); // mark's heel = text baseline
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              endTrigger: slot,
              end: "bottom 68%",
              scrub: true,
              invalidateOnRefresh: true,
              onRefreshInit: () => {
                m = measure();
              },
              onUpdate: (self) => {
                if (self.progress > 0.01) hurryToBrand();
              },
            },
          })
          // linear drop = it hovers at a steady height on screen while the page
          // scrolls underneath; the shrink and the slide to the left margin ease
          .to(flight, { y: () => m.y, duration: 1, ease: "none" }, 0)
          .to(
            flight,
            {
              x: () => m.x,
              scale: () => m.s,
              duration: 1,
              ease: "power2.inOut",
            },
            0,
          );
        document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());
        return () => {
          slot.style.width = "";
        };
      });

      // smaller screens: the Manifesto shows its own inline logo, so the hero
      // lockup just drifts + dims as the hero scrolls out
      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(
          root,
          { yPercent: 0, opacity: 1 },
          {
            yPercent: 22,
            opacity: 0.3,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      const onResize = () => {
        // (-1 = intro still showing the bare mark, the dot sits at its heel)
        if (!turning && current >= 0) gsap.set(dot, { x: dotX(current) });
      };
      window.addEventListener("resize", onResize);
      cleanups.push(() => window.removeEventListener("resize", onResize));
      document.fonts?.ready.then(() => alive && onResize());

      // Remounts (Fast Refresh, navigating back home) and loads that restore a
      // scrolled position skip the choreography and settle straight on the name.
      if (isIntroReleased() || window.scrollY > window.innerHeight * 0.5) {
        showStatic(LAST);
        if (!isIntroReleased()) gsap.delayedCall(0.35, releaseIntro);
        return cleanup;
      }

      // ---- first-load intro, played above the Preloader curtain ----
      current = -1;
      gsap.set(root, { zIndex: Z_ABOVE_CURTAIN });
      gsap.set(faces, { autoAlpha: 0 });
      gsap.set(dot, { x: 0 });

      // start with mark + dot alone, centred in the viewport and a touch larger
      const markRect = mark.getBoundingClientRect();
      const soloW = dot.getBoundingClientRect().right - markRect.left;
      gsap.set(row, {
        x: window.innerWidth / 2 - (markRect.left + soloW / 2),
        scale: 1.18,
        transformOrigin: `${soloW / 2}px 50%`,
      });

      const intro = gsap.timeline();
      active = intro;
      intro
        .set("[data-bar]", { autoAlpha: 0 })
        .from("[data-bar]", {
          x: (_i, el) => ((el as HTMLElement).dataset.dir === "l" ? -180 : 180),
          autoAlpha: 0,
          duration: 0.75,
          ease: "power4.out",
          stagger: (_i, el) => Number((el as HTMLElement).dataset.row) * 0.09,
        })
        .fromTo(
          dot,
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.2)" },
          "-=0.2",
        )
        .to({}, { duration: 0.2 }) // brief hold on the finished mark
        .addLabel("open")
        .to(
          row,
          { x: 0, scale: 1, duration: 1.15, ease: "power4.inOut" },
          "open",
        )
        // curtain starts dissolving while the lockup is still opening up
        .call(releaseIntro, [], "open+=0.2")
        .add(() => {
          active = turn(0, null, schedule);
        }, "open+=0.22")
        // drop back into the page once the curtain (0.8s) is gone, so the
        // lockup can never scroll over the fixed nav
        .set(root, { clearProps: "zIndex" }, "open+=1.3");

      return cleanup;
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      role="img"
      aria-label="23media — marketing, brand, social, develop, media"
      className="pointer-events-none relative flex flex-1 items-center justify-center py-12 select-none"
      style={
        {
          "--h": "clamp(2.9rem, min(13vw, 21svh), 10.5rem)",
        } as React.CSSProperties
      }
    >
      <div
        data-lockup-flight
        aria-hidden
        className="flex will-change-transform"
      >
        <div data-lockup-row className="flex items-end">
          <svg
            data-lockup-mark
            viewBox={MARK_VIEWBOX}
            fill="none"
            className="w-auto shrink-0 overflow-visible"
            style={{ height: "var(--h)" }}
          >
            <defs>
              {MARK_BANDS.map(([top, bottom], i) => (
                <clipPath key={i} id={`lockup-band-${i}`}>
                  <rect
                    x={-PAD}
                    y={top - SEAM}
                    width={MARK_W + PAD * 2}
                    height={bottom - top + SEAM * 2}
                  />
                </clipPath>
              ))}
            </defs>
            {MARK_BANDS.map((_, i) => (
              // The clip lives inside the animated group so each slice moves as one piece.
              <g
                key={i}
                data-bar
                data-row={i}
                data-dir={i % 2 === 0 ? "l" : "r"}
              >
                <g clipPath={`url(#lockup-band-${i})`}>
                  <path
                    d={MARK_PATH}
                    fillRule="evenodd"
                    fill="var(--color-bone, #f4f3ef)"
                  />
                </g>
              </g>
            ))}
          </svg>

          <div
            className="relative"
            style={{
              height: "var(--h)",
              marginLeft: `calc(var(--h) * ${GAP})`,
            }}
          >
            {/* invisible sizer: reserves the widest word (+ dot) so the mark
              never shifts while the words change */}
            <div className="invisible grid h-0 overflow-hidden whitespace-nowrap">
              {WORDS.map((w) => (
                <span
                  key={w.t}
                  className={`col-start-1 row-start-1 ${faceClass(w.brand)}`}
                  style={{
                    ...faceFont(w.brand),
                    paddingRight: "calc(var(--h) * 0.2)",
                  }}
                >
                  {w.t}
                </span>
              ))}
            </div>

            <div
              className="absolute inset-0"
              style={{ perspective: "calc(var(--h) * 7)" }}
            >
              <div
                data-cube
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {WORDS.map((w) => (
                  <span
                    key={w.t}
                    data-face
                    className={`absolute left-0 top-0 block h-full whitespace-nowrap text-bone [backface-visibility:hidden] ${faceClass(
                      w.brand,
                    )} ${w.brand ? "" : "opacity-0"}`}
                    style={{ ...faceFont(w.brand), lineHeight: 1 }}
                  >
                    {/* strut: pins the text baseline to the face's bottom edge,
                      i.e. the mark's baseline, whatever the font metrics */}
                    <span className="inline-block h-full w-0 align-baseline" />
                    <span data-face-text className="inline-block">
                      {w.t}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <span
              data-lockup-dot
              className="absolute bottom-0 left-0 block rounded-full bg-accent opacity-0"
              style={{
                width: `calc(var(--h) * ${DOT})`,
                height: `calc(var(--h) * ${DOT})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
