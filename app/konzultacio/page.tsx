import type { Metadata } from "next";
import Link from "next/link";
import Providers from "../components/Providers";
import Logo from "../components/Logo";
import ConsultForm from "./ConsultForm";

export const metadata: Metadata = {
  title: "Ingyenes konzultáció — 23media",
  description:
    "30 perces, kötelezettség nélküli hívás: átnézzük, hol tart a márkád, és három konkrét lépést adunk, amit már holnap megléphetsz.",
};

export default function KonzultacioPage() {
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

      <main className="relative">
        <ConsultForm />
      </main>
    </Providers>
  );
}
