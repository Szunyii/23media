import Link from "next/link";
import { scrollToSection } from "../lib/sections";
import { MARK_PATH, MARK_VIEWBOX } from "../lib/mark";

const inner = (
  <>
    <svg
      viewBox={MARK_VIEWBOX}
      aria-hidden
      className="h-5.5 w-auto fill-current transition-colors duration-300 group-hover:text-accent"
    >
      <path d={MARK_PATH} fillRule="evenodd" />
    </svg>
    <span className="font-sans text-[1.3rem] font-medium leading-none tracking-[-0.02em]">
      {/* media */}
    </span>
  </>
);

/**
 * Brand lockup: the "23" mark + "media" set in the plain sans. On the home
 * page it scrolls to the top; pass `href` on subpages so it navigates instead
 * (there is no `#top` section to scroll to there).
 */
export default function Logo({
  className = "",
  href,
}: {
  className?: string;
  href?: string;
}) {
  const cls = `group flex items-center gap-[7px] ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} aria-label="23media — főoldal">
        {inner}
      </Link>
    );
  }
  return (
    <button
      onClick={() => scrollToSection("top")}
      className={cls}
      aria-label="23media — vissza a tetejére"
    >
      {inner}
    </button>
  );
}
