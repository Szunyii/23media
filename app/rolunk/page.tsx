import Image from "next/image";
import Link from "next/link";
import Subpage from "../components/Subpage";
import SectionLabel from "../components/SectionLabel";
import JsonLd from "../components/JsonLd";
import {
  FOUNDER,
  MANIFESTO,
  PERSONAL_BRANDING,
  SERVICES,
  STATS,
  plain,
  type LetterPart,
} from "../lib/content";
import { pageMetadata } from "../lib/meta";
import { pageGraph } from "../lib/schema";
import { SITE_DESCRIPTION } from "../lib/site";

const DESCRIPTION =
  "Kik vagyunk: egy 12 fős média és marketing ügynökség, ahol minden szakértő egy kottából játszik. Kiáltvány, számok, szolgáltatások és az alapító, Engi Ádám levele.";

export const metadata = pageMetadata("about", DESCRIPTION);

/** The founder's letter parts: `.hl` (self-awareness only) and the lead's bone weight. */
function Parts({ parts }: { parts: LetterPart[] }) {
  return parts.map((part, j) =>
    typeof part === "string" ? (
      part
    ) : "hl" in part ? (
      <mark key={j} className="hl">
        {part.hl}
      </mark>
    ) : (
      <strong key={j} className="font-semibold text-bone">
        {part.strong}
      </strong>
    ),
  );
}

/**
 * Rólunk — the agency in one quiet read: the slogan, the manifesto, the
 * figures, what we do, and the founder's letter. Same copy as the home page
 * (lib/content.ts), set still: no scroll choreography on a page people come
 * to for facts.
 */
export default function RolunkPage() {
  return (
    <Subpage>
      <JsonLd data={pageGraph("about", DESCRIPTION)} />

      {/* opening */}
      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40">
        <SectionLabel className="mb-6">Rólunk</SectionLabel>
        <h1 className="display max-w-[14ch] text-[clamp(2.8rem,7.4vw,7.6rem)] [text-wrap:balance]">
          Tervezéstől a kivitelezésig,{" "}
          <span className="serif-italic text-accent">egy kézben!</span>
        </h1>
        <p className="mt-8 max-w-[52ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-bone-dim">
          {SITE_DESCRIPTION}
        </p>
      </section>

      {/* manifesto */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="eyebrow mb-6 text-muted">Kiáltvány</p>
            <p className="serif-italic text-[clamp(1.9rem,3.4vw,3.2rem)] leading-[1.1] text-bone">
              {MANIFESTO.lead}
            </p>
          </div>
          <div className="max-w-[60ch] space-y-6 text-[clamp(1rem,1.15vw,1.12rem)] leading-[1.65] text-bone-dim lg:pt-12">
            <p>{MANIFESTO.body}</p>
            {MANIFESTO.points.map((p) => (
              <p key={p} className="border-l-2 border-accent pl-5 text-bone">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* figures */}
      <section className="border-t border-line" aria-label="Számokban">
        <ul className="mx-auto grid max-w-[1600px] grid-cols-1 px-5 sm:grid-cols-3 sm:px-8">
          {STATS.map((s) => (
            <li
              key={s.label}
              className="border-b border-line py-10 last:border-b-0 sm:border-b-0 sm:border-r sm:px-8 sm:py-16 sm:first:pl-0 sm:last:border-r-0"
            >
              <p className="display text-[clamp(3rem,6vw,5.6rem)] text-bone">
                {s.value}
                {s.plus && <span className="text-accent">+</span>}
              </p>
              <p className="mt-3 font-display text-[clamp(1.05rem,1.4vw,1.35rem)] font-medium tracking-tight text-bone">
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* what we do */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28">
          <SectionLabel className="mb-10">Amiben segítünk</SectionLabel>
          <ol className="border-t border-line">
            {[
              ...SERVICES.map((s) => ({ n: s.n, title: s.title, desc: plain(s.desc) })),
              { n: "06", title: PERSONAL_BRANDING.title, desc: PERSONAL_BRANDING.body },
            ].map((s) => (
              <li
                key={s.n}
                className="grid gap-3 border-b border-line py-7 sm:grid-cols-[3rem_minmax(0,4fr)_minmax(0,7fr)] sm:gap-6 sm:py-9"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{s.n}</span>
                <h2 className="font-display text-[clamp(1.35rem,2vw,1.9rem)] font-semibold tracking-tight text-bone">
                  {s.title}
                </h2>
                <p className="max-w-[60ch] text-[15px] leading-relaxed text-bone-dim sm:text-base">{s.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8">
            <Link
              href="/#services"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-accent"
            >
              Részletek a főoldalon →
            </Link>
          </p>
        </div>
      </section>

      {/* founder */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <figure className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden bg-ink-soft">
              <Image
                src={FOUNDER.portrait}
                alt={`${FOUNDER.name} portréja`}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[50%_28%] grayscale"
              />
            </div>
            <figcaption className="mt-5">
              <p className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
                {FOUNDER.name}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim">
                Alapító · {FOUNDER.roles.join(" · ")}
              </p>
            </figcaption>
          </figure>

          <div>
            <SectionLabel as="h2" className="mb-8">
              Levél a vállalkozóknak
            </SectionLabel>
            <p className="serif-italic text-[clamp(1.65rem,2.9vw,2.8rem)] leading-[1.15] text-bone">
              „{FOUNDER.lead.before}
              <span className="text-accent">{FOUNDER.lead.accent}</span>”
            </p>
            <div className="mt-10 max-w-[58ch] space-y-6 text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.65] text-bone-dim">
              {FOUNDER.letter.map((p, i) => (
                <p key={i}>
                  {p.lead && <strong className="font-semibold text-bone">{p.lead}</strong>}
                  <Parts parts={p.body} />
                </p>
              ))}
            </div>
            <p className="serif-italic mt-10 max-w-[34ch] text-balance border-l-2 border-accent pl-6 text-[clamp(1.3rem,1.8vw,1.7rem)] leading-[1.25] text-bone">
              {FOUNDER.closing}
            </p>
          </div>
        </div>
      </section>

      {/* next step */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-8 px-5 py-20 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <p className="display max-w-[16ch] text-[clamp(2.2rem,4.6vw,4.4rem)] [text-wrap:balance]">
            {/* the home page's rotating CTA line */}
            Indítsunk <span className="serif-italic text-accent">projektet!</span>
          </p>
          <Link
            href="/konzultacio"
            className="group flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-ink transition-transform duration-300 hover:scale-[1.03]"
          >
            Ingyenes konzultáció
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </Subpage>
  );
}
