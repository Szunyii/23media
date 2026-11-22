"use client";

import { useId, useRef } from "react";
import { getImageProps } from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { SIGNATURE } from "../lib/signature";

/** Pen speed in signature px per second, and the pause for each pen lift. */
const SPEED = 4200;
const LIFT = 0.14;

// The scan is 1931px wide but shown at ~400 CSS px: let the image optimiser
// serve a 2x-sized WebP/AVIF instead of the 400 KB PNG.
const { src: INK_SRC } = getImageProps({
  src: SIGNATURE.src,
  alt: "",
  width: 540,
  height: Math.round((540 * SIGNATURE.height) / SIGNATURE.width),
}).props;

/**
 * The founder's handwritten signature, signed in front of the reader.
 *
 * The scan is recoloured to `currentColor` and masked by the pen path from
 * `lib/signature`; sweeping each stroke's dash offset uncovers the ink in the
 * order it was written. Without JS or with reduced motion the mask is never
 * attached, so the full signature simply shows.
 */
export default function Signature({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const inkId = `sig-ink-${uid}`;
  const maskId = `sig-pen-${uid}`;

  useGSAP(
    () => {
      const svg = ref.current;
      const ink = svg?.querySelector<SVGImageElement>("[data-sig-ink]");
      if (!svg || !ink) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const strokes = gsap.utils.toArray<SVGPathElement>("[data-sig-stroke]", svg);
      gsap.set(strokes, {
        strokeDasharray: (i) => `${SIGNATURE.strokes[i].len} ${SIGNATURE.strokes[i].len + 2}`,
        strokeDashoffset: (i) => SIGNATURE.strokes[i].len + 1,
      });
      ink.setAttribute("mask", `url(#${maskId})`);

      // each pen-down eases in and out of its own motion; speed is constant
      // along the paper, so the long sweeps take longer than the accent
      const tl = gsap.timeline({
        paused: true,
        // a beat after the closing line above has settled in
        delay: 0.35,
        // the mask covers >99.9% of the ink; dropping it once signed hands the
        // last antialiased fringe back to the scan
        onComplete: () => ink.removeAttribute("mask"),
      });
      SIGNATURE.strokes.forEach((s, i) => {
        tl.to(
          strokes[i],
          {
            strokeDashoffset: 0,
            duration: Math.max(0.18, s.len / SPEED),
            ease: "sine.inOut",
          },
          i === 0 ? 0 : `+=${LIFT}`,
        );
      });

      ScrollTrigger.create({
        trigger: svg,
        start: "top 85%",
        once: true,
        onEnter: () => tl.restart(true), // true: honour the delay
      });

      // the context reverts the tweens and the trigger; the mask attribute
      // was set by hand, so it goes by hand
      return () => ink.removeAttribute("mask");
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${SIGNATURE.width} ${SIGNATURE.height}`}
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        {/* recolour the navy scan to the text colour, keeping its alpha */}
        <filter id={inkId} colorInterpolationFilters="sRGB">
          <feFlood floodColor="currentColor" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={SIGNATURE.width}
          height={SIGNATURE.height}
        >
          <g
            fill="none"
            stroke="#fff"
            strokeWidth={SIGNATURE.pen}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {SIGNATURE.strokes.map((s, i) => (
              <path key={i} data-sig-stroke d={s.d} />
            ))}
          </g>
        </mask>
      </defs>
      <image
        data-sig-ink
        href={INK_SRC}
        width={SIGNATURE.width}
        height={SIGNATURE.height}
        preserveAspectRatio="none"
        filter={`url(#${inkId})`}
      />
    </svg>
  );
}
