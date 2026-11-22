import Subpage from "./Subpage";
import SectionLabel from "./SectionLabel";
import RichText from "./RichText";
import JsonLd from "./JsonLd";
import { LEGAL_EFFECTIVE, type LegalDoc } from "../lib/legal";
import { pageGraph } from "../lib/schema";
import type { PageKey } from "../lib/site";

/**
 * A legal page — privacy notice, terms, imprint — set as a plain reading
 * column: the title holds still on the left from lg up, the numbered sections
 * run on the right. The text comes from lib/legal.ts, the same data the
 * Markdown version is built from.
 */
export default function LegalPage({ doc, pageKey }: { doc: LegalDoc; pageKey: PageKey }) {
  return (
    <Subpage>
      <JsonLd data={pageGraph(pageKey, doc.description)} />
      <article className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-40">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <header className="lg:sticky lg:top-32 lg:self-start">
            <SectionLabel className="mb-6">Jogi információk</SectionLabel>
            <h1 className="display text-[clamp(2.4rem,5vw,4.6rem)] [text-wrap:balance]">{doc.title}</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-bone-dim">
              <RichText text={doc.intro} />
            </p>
            <p className="eyebrow mt-8 text-muted">Hatályos: {LEGAL_EFFECTIVE}</p>
          </header>

          <div className="max-w-[68ch]">
            {doc.sections.map((s, i) => (
              <section key={s.h} className="border-t border-line py-8 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-8">
                <h2 className="mb-5 flex items-baseline gap-4 font-display text-[1.35rem] font-semibold tracking-tight text-bone sm:text-[1.6rem]">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.h}
                </h2>
                <div className="space-y-4 text-[15px] leading-relaxed text-bone-dim sm:text-base">
                  {s.blocks.map((b, j) => {
                    if ("p" in b)
                      return (
                        <p key={j}>
                          <RichText text={b.p} />
                        </p>
                      );
                    if ("ul" in b)
                      return (
                        <ul key={j} className="space-y-2">
                          {b.ul.map((li) => (
                            <li key={li} className="flex gap-3">
                              <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                              <span>
                                <RichText text={li} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      );
                    return (
                      <dl key={j} className="divide-y divide-line rounded-sm border border-line">
                        {b.rows.map(([k, v]) => (
                          <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
                            <dt className="eyebrow pt-[0.2em] text-muted">{k}</dt>
                            <dd className="text-bone">
                              <RichText text={v} />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </Subpage>
  );
}
