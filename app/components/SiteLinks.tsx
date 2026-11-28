import Link from "next/link";
import { PAGES } from "../lib/site";

/**
 * Links to the "who runs this site" pages — about, contact and the legal
 * pages. They are what visitors and AI agents look for to tell a real business
 * from a ghost site, so every page links them. The `rel` values are the
 * registered link relations for them (RFC 6903 + IANA), for agents that
 * read relations rather than link text.
 */
export const ABOUT_LINKS = [
  { key: "about", rel: "about" },
  { key: "contact", rel: undefined },
] as const;

/** In the order of the lawyer's checklist (Weboldali jogi implementációs jegyzék, point 4). */
export const LEGAL_LINKS = [
  { key: "terms", rel: "terms-of-service" },
  { key: "privacy", rel: "privacy-policy" },
  { key: "cookies", rel: undefined },
  { key: "imprint", rel: undefined },
] as const;

/** The compact footer of the subpages: every one of those links, plus ©. */
export function SubpageFooter() {
  const links = [...ABOUT_LINKS, { key: "consultation", rel: undefined } as const, ...LEGAL_LINKS];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Oldalak">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map((l) => (
              <li key={l.key}>
                <Link
                  href={PAGES[l.key].path}
                  rel={l.rel}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-dim transition-colors hover:text-accent"
                >
                  {PAGES[l.key].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          © {new Date().getFullYear()} 23media — Minden jog fenntartva
        </p>
      </div>
    </footer>
  );
}
