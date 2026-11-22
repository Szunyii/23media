import Link from "next/link";
import Subpage from "../components/Subpage";
import SectionLabel from "../components/SectionLabel";
import JsonLd from "../components/JsonLd";
import { CONSULT } from "../lib/content";
import { pageMetadata } from "../lib/meta";
import { pageGraph } from "../lib/schema";
import { COMPANY, CONTACT_EMAIL, PAGES } from "../lib/site";

const DESCRIPTION =
  "Írj nekünk a 23@23media.hu címre, vagy kérj ingyenes, 30 perces konzultációt — 24 órán belül válaszolunk.";

export const metadata = pageMetadata("contact", DESCRIPTION);

/**
 * Kapcsolat — the two ways in (e-mail, the consultation form), what happens
 * after, and who we are legally. No phone or street address: the client
 * doesn't publish them (2026-11-22).
 */
export default function KapcsolatPage() {
  const company = [COMPANY.legalName, COMPANY.seat].filter(Boolean).join(" · ");

  return (
    <Subpage>
      <JsonLd data={pageGraph("contact", DESCRIPTION)} />

      <section className="mx-auto max-w-[1600px] px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40">
        <SectionLabel className="mb-6">Kapcsolat</SectionLabel>
        {/* the home page's closing line */}
        <h1 className="display max-w-[16ch] text-[clamp(2.6rem,6.5vw,7.4rem)] [text-wrap:balance]">
          Elindult benned valami és szeretnél róla{" "}
          <span className="serif-italic text-accent">beszélni?</span>
        </h1>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1600px] sm:grid-cols-2">
          <div className="border-b border-line px-5 py-12 sm:border-b-0 sm:border-r sm:px-8 sm:py-16">
            <p className="eyebrow mb-5 text-muted">E-mail</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group inline-block font-display text-[clamp(1.8rem,3.4vw,3.2rem)] font-semibold tracking-tight text-bone transition-colors hover:text-accent"
            >
              {CONTACT_EMAIL}
              <span className="block h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
            <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-bone-dim">
              {CONSULT.steps[0].t}.
            </p>
          </div>

          <div className="px-5 py-12 sm:px-8 sm:py-16">
            <p className="eyebrow mb-5 text-muted">{CONSULT.title}</p>
            <p className="max-w-[44ch] text-[clamp(1.05rem,1.3vw,1.2rem)] leading-relaxed text-bone">
              {CONSULT.description}
            </p>
            <Link
              href={PAGES.consultation.path}
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              Jelentkezem
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <SectionLabel as="h2" className="self-start">
            Mi történik ezután
          </SectionLabel>
          <ol className="border-t border-line">
            {CONSULT.steps.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-line py-5 sm:grid-cols-[3rem_1fr] sm:gap-4"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{s.n}</span>
                <div>
                  <p className="font-display text-[1.15rem] font-semibold tracking-tight text-bone">{s.t}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-bone-dim">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* who we are legally; the legal pages themselves are in the footer */}
      <section className="border-t border-line">
        <p className="mx-auto max-w-[1600px] px-5 py-10 text-[15px] text-bone-dim sm:px-8">
          {company && <span className="text-bone">{company} — </span>}A szolgáltató adatai az{" "}
          <Link
            href={PAGES.imprint.path}
            className="text-bone underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent"
          >
            Impresszumban
          </Link>{" "}
          olvashatók.
        </p>
      </section>
    </Subpage>
  );
}
