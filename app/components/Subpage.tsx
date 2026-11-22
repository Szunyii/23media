import Link from "next/link";
import Providers from "./Providers";
import Logo from "./Logo";
import { SubpageFooter } from "./SiteLinks";

/**
 * Frame of the quiet subpages (Rólunk, Kapcsolat, the legal pages): the
 * consultation page's header — logo home, "Vissza" — and the links footer.
 */
export default function Subpage({ children }: { children: React.ReactNode }) {
  return (
    <Providers minimal>
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8">
          <Logo href="/" />
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone"
          >
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
            >
              ←
            </span>
            Vissza
          </Link>
        </div>
      </header>
      <main className="relative">{children}</main>
      <SubpageFooter />
    </Providers>
  );
}
