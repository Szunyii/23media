"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

type Props = {
  text: string;
  as?: "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** delay between words */
  stagger?: number;
  start?: string;
};

/**
 * Splits a string into word spans inside clipped lines and reveals them
 * upward when the block scrolls into view. SSR-safe (words rendered in markup).
 */
export default function RevealText({
  text,
  as = "div",
  className = "",
  stagger = 0.06,
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as React.ElementType;
  const words = text.split(" ");

  useGSAP(
    () => {
      const targets = ref.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (!targets || !targets.length) return;
      gsap.set(targets, { yPercent: 115 });
      gsap.to(targets, {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ clipPath: "inset(-20% 0 -10% 0)" }}
        >
          <span data-word className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
