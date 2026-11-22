import type { HTMLAttributes } from "react";
import { MARK_SHEAR } from "../lib/mark";

type Props = HTMLAttributes<HTMLElement> & {
  /** `h2` when the label is the only heading the section has (Founder). */
  as?: "div" | "h2";
  /** `lg` for a section that opens on the label alone, with no headline under it. */
  size?: "md" | "lg";
};

/**
 * Section wayfinding label: a small accent tab cut with the "23" mark's shear,
 * then the section name in bone — a step up from the muted mono eyebrows so
 * the reader can tell at a glance which section they're in.
 * Extra props (className for spacing, data-* hooks for GSAP) go to the wrapper.
 */
export default function SectionLabel({
  children,
  className = "",
  as: Tag = "div",
  size = "md",
  ...rest
}: Props) {
  const lg = size === "lg";
  return (
    <Tag className={`flex items-center ${lg ? "gap-4" : "gap-3"} ${className}`} {...rest}>
      <span
        aria-hidden
        className={`shrink-0 bg-accent ${lg ? "h-[1.15rem] w-2.5" : "h-3.5 w-2"}`}
        style={{ transform: MARK_SHEAR }}
      />
      {/* .eyebrow is an unlayered rule, so a Tailwind size class would lose to
          its 0.72rem — the bump goes inline */}
      <span
        className="eyebrow font-medium text-bone"
        style={{ fontSize: lg ? "clamp(0.95rem, 1.2vw, 1.1rem)" : "0.8rem" }}
      >
        {children}
      </span>
    </Tag>
  );
}
