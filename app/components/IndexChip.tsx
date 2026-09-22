import { MARK_SHEAR } from "../lib/mark";

/**
 * Index number on a parallelogram chip cut with the "23" mark's shear.
 * `on` keeps the chip stamped (flagship tiles); otherwise the chip wipes in
 * from the left on the parent `group`'s hover and the number flips to ink —
 * the cards' hover mark, in place of a wash over the whole tile.
 */
export default function IndexChip({
  n,
  on = false,
  className = "",
}: {
  n: string;
  on?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex h-6 items-center px-3 font-mono text-[10px] tracking-[0.2em] ${
        on
          ? "text-ink"
          : "text-accent transition-colors delay-100 duration-300 group-hover:text-ink motion-reduce:transition-none"
      } ${className}`}
    >
      <span
        aria-hidden
        // the clip is cut in the chip's own space, so the wipe's leading edge
        // comes out slanted with the shear — a small sheared wipe, like the
        // Personal Branding panel's. Opacity too: Chrome's antialiasing draws
        // a hairline of a fully clipped skewed box.
        className={`absolute inset-0 bg-accent ${
          on
            ? ""
            : "opacity-0 [clip-path:inset(0_100%_0_0)] transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:[clip-path:inset(0)] motion-reduce:transition-none"
        }`}
        style={{ transform: MARK_SHEAR }}
      />
      <span className="relative">{n}</span>
    </span>
  );
}
