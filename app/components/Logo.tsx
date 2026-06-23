import { scrollToSection } from "../lib/sections";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => scrollToSection("top")}
      className={`group flex items-baseline gap-[2px] ${className}`}
      aria-label="23media — vissza a tetejére"
      data-cursor=""
    >
      <span className="display text-[1.45rem] leading-none tracking-tight">
        23media
      </span>
      <span className="h-[5px] w-[5px] translate-y-[-1px] rounded-full bg-accent transition-transform duration-300 group-hover:scale-150" />
    </button>
  );
}
