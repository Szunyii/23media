"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "../lib/gsap";
import Magnetic from "../components/Magnetic";
import { sendInquiry, type InquiryFields, type InquiryState } from "./actions";
import { CONSULT, CONSULT_PRIVACY_ACK } from "../lib/content";
import { PAGES } from "../lib/site";
import { getModelContext, type AgentSubmitEvent } from "../lib/webmcp";

const STEPS = CONSULT.steps;

/** The form's WebMCP tool name (declarative API — see the <form> attributes). */
const TOOL_NAME = "request_consultation";

const EMPTY: InquiryFields = {
  lastName: "",
  firstName: "",
  email: "",
  company: "",
  phone: "",
  occupation: "",
  website: "",
  privacy: false,
};

/* Inline "fill in the blank" field — bare underline, accent caret, no box. */
const FIELD =
  "min-w-0 rounded-none border-0 border-b border-bone/25 bg-transparent px-0 py-1.5 font-display font-medium tracking-tight text-bone caret-accent outline-none transition-colors duration-300 placeholder:text-muted focus:border-accent sm:py-1";

const SENTENCE =
  "flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 font-display text-[1.3rem] font-medium leading-[1.3] tracking-tight sm:gap-x-3 sm:gap-y-3 sm:text-[clamp(1.45rem,2.6vw,2.3rem)]";

/* "nem kötelező" — a small helper line hanging under the input it belongs to.
   OPTIONAL_FIELD wraps the two, so the pair is one flex item of the sentence
   and the label still sits on the input's baseline. */
const OPTIONAL_FIELD = "flex flex-[1_0_14ch] flex-col";
const OPTIONAL =
  "mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted sm:mt-2";

/**
 * "What happens next" — the three steps and the e-mail fallback. Rendered
 * twice and shown once: inside the sticky pitch column on desktop, and under
 * the form (with its own heading) wherever the layout stacks, so on a phone
 * the form sits right below the headline instead of a screen further down.
 */
function Steps({ stacked = false, className = "" }: { stacked?: boolean; className?: string }) {
  return (
    <div className={className}>
      {stacked && (
        <h2
          data-consult-row
          className="mb-5 flex translate-y-4 items-center gap-3 opacity-0 sm:mb-6"
        >
          <span aria-hidden className="h-px w-6 shrink-0 bg-accent sm:w-10" />
          <span className="eyebrow text-bone-dim">Mi történik ezután</span>
        </h2>
      )}

      <ol className="border-t border-line">
        {STEPS.map((s) => (
          <li
            key={s.n}
            data-consult-row
            className="grid translate-y-4 grid-cols-[2.25rem_1fr] gap-3 border-b border-line py-4 opacity-0 sm:grid-cols-[3rem_1fr] sm:gap-4 sm:py-5"
          >
            <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
              {s.n}
            </span>
            <div>
              <p className="font-display text-[1.1rem] font-semibold tracking-tight">
                {s.t}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-bone-dim">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <p
        data-consult-row
        className="mt-6 translate-y-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted opacity-0 sm:mt-8"
      >
        Inkább írnál?{" "}
        <a
          href="mailto:23@23media.hu"
          className="text-bone-dim transition-colors hover:text-accent"
        >
          23@23media.hu
        </a>
      </p>
    </div>
  );
}

export default function ConsultForm() {
  const ref = useRef<HTMLElement>(null);
  const [state, formAction, pending] = useActionState<InquiryState, FormData>(
    sendInquiry,
    { status: "idle" },
  );
  const values = state.status === "error" ? state.fields : EMPTY;

  // WebMCP: an in-browser agent can fill this form as the `request_consultation`
  // tool; the visitor still presses the button. Two things the attributes
  // can't do on their own:
  //  - the honeypot is a form field too, so an agent may fill it and the
  //    request would be silently dropped — it is cleared whenever an agent
  //    has filled the form or submits it (capture phase: before React reads
  //    the FormData);
  //  - an agent-invoked submit is answered with the outcome of the action
  //    (bubble phase: after React has taken the event and prevented it).
  const formRef = useRef<HTMLFormElement>(null);
  const agentReply = useRef<((result: unknown) => void) | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const clearTrap = () => {
      const trap = form.elements.namedItem("fax");
      if (trap instanceof HTMLInputElement) trap.value = "";
    };
    const beforeReact = (e: Event) => {
      if (e.target === form && (e as AgentSubmitEvent).agentInvoked) clearTrap();
    };
    const afterReact = (e: Event) => {
      const ev = e as AgentSubmitEvent;
      if (e.target !== form || !ev.agentInvoked || !e.defaultPrevented) return;
      if (typeof ev.respondWith !== "function") return;
      ev.respondWith(
        new Promise((resolve) => {
          agentReply.current = resolve;
        }),
      );
    };
    const onActivated = (e: Event) => {
      if ((e as Event & { toolName?: string }).toolName === TOOL_NAME) clearTrap();
    };
    const mc = getModelContext();
    window.addEventListener("submit", beforeReact, true);
    window.addEventListener("submit", afterReact);
    mc?.addEventListener?.("toolactivated", onActivated);
    return () => {
      window.removeEventListener("submit", beforeReact, true);
      window.removeEventListener("submit", afterReact);
      mc?.removeEventListener?.("toolactivated", onActivated);
    };
  }, [state.status]);

  useEffect(() => {
    const reply = agentReply.current;
    if (!reply || state.status === "idle") return;
    agentReply.current = null;
    reply(
      state.status === "ok"
        ? {
            status: "sent",
            message: `A jelentkezés elküldve. A 23media 24 órán belül válaszol a(z) ${state.email} címre, vagy telefonon jelentkezik.`,
          }
        : { error: state.message },
    );
  }, [state]);

  // Entrance: headline lines slide up out of their masks, then the form
  // sentences and side notes fade in one after another.
  useGSAP(
    () => {
      // Deterministic hidden state owned by GSAP (never mix class translates
      // with tweened transforms); CSS opacity-0 only prevents a pre-JS flash.
      // <Steps> exists twice and CSS lays out one copy: only that one joins
      // the stagger. The other goes straight to its final state, so it is
      // already there if the viewport later crosses the `lg` breakpoint.
      const rows = Array.from(
        ref.current?.querySelectorAll<HTMLElement>("[data-consult-row]") ?? [],
      );
      const live = rows.filter((el) => el.offsetParent !== null);
      const parked = rows.filter((el) => el.offsetParent === null);
      if (parked.length) gsap.set(parked, { opacity: 1, y: 0 });
      gsap.set(live, { opacity: 0, y: 16 });
      gsap
        .timeline({ delay: 0.15 })
        .from("[data-consult-line] > span", {
          yPercent: 115,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.1,
        })
        .to(
          live,
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 },
          "-=0.7",
        );
    },
    { scope: ref },
  );

  // Success view gets its own reveal when it mounts.
  useGSAP(
    () => {
      if (state.status !== "ok") return;
      gsap.from("[data-consult-success] > *", {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
      });
    },
    { scope: ref, dependencies: [state.status] },
  );

  return (
    <section
      ref={ref}
      className="mx-auto grid min-h-[100svh] max-w-[1600px] gap-9 px-5 pb-16 pt-24 sm:gap-16 sm:px-8 sm:pb-24 sm:pt-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20"
    >
      {/* ---------- left: pitch ---------- */}
      <div className="lg:sticky lg:top-40 lg:self-start">
        {/* .eyebrow is an unlayered rule, so the phone size/tracking need `!`.
            Scaled with the viewport there so the line never wraps. */}
        <div
          data-consult-row
          className="flex translate-y-4 items-center gap-2.5 opacity-0 sm:gap-3"
        >
          <span aria-hidden className="h-px w-6 shrink-0 bg-accent sm:w-10" />
          <span className="eyebrow text-bone-dim max-sm:whitespace-nowrap max-sm:text-[length:clamp(8.5px,2.7vw,0.72rem)]! max-sm:tracking-[0.12em]!">
            Ingyenes · 30 perc · kötelezettség nélkül
          </span>
        </div>

        <h1 className="display mt-5 text-[clamp(2.7rem,6.6vw,6.6rem)] sm:mt-8">
          <span data-consult-line className="block overflow-hidden pb-[0.12em]">
            <span className="block">Beszéljünk</span>
          </span>
          <span data-consult-line className="block overflow-hidden pb-[0.18em]">
            <span className="block">
              a <span className="serif-italic text-accent">márkádról.</span>
            </span>
          </span>
        </h1>

        {/* Client copy, verbatim. On a phone only the middle sentence (the
            promise) stays, so the form starts within the first screen; the
            full pitch returns from `sm` up. */}
        <p
          data-consult-row
          className="mt-3 max-w-md translate-y-4 text-balance text-[15px] leading-relaxed text-bone-dim opacity-0 sm:mt-8"
        >
          <span className="hidden sm:inline">
            Hozhatod a nagy terveket, meg a teljes káoszt is.{" "}
          </span>
          Fél óra alatt találunk három konkrét következő lépést a márkádnak.
          <span className="hidden sm:inline"> A folytatás a te döntésed!</span>
        </p>

        <Steps className="mt-12 hidden lg:block" />
      </div>

      {/* ---------- right: the form ---------- */}
      <div className="lg:border-l lg:border-line lg:pl-20">
        {state.status === "ok" ? (
          <div
            data-consult-success
            className="flex min-h-[60vh] flex-col justify-center"
            role="status"
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="eyebrow text-bone-dim">Megkeresés elküldve</span>
            </div>
            <h2 className="display mt-8 text-[clamp(2.4rem,5.4vw,5.4rem)]">
              Köszönjük, {state.firstName}.
              <br />
              <span className="serif-italic text-accent">Hamarosan jelentkezünk.</span>
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-bone-dim">
              24 órán belül írunk a{" "}
              <span className="text-bone">{state.email}</span> címre, vagy
              hívunk a megadott számon, hogy egyeztessük az időpontot.
            </p>
            <Link
              href="/"
              className="group mt-12 inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone"
            >
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Vissza a főoldalra
            </Link>
          </div>
        ) : (
          <form
            ref={formRef}
            action={formAction}
            toolname={TOOL_NAME}
            tooldescription="Ingyenes, 30 perces, kötelezettség nélküli konzultáció kérése a 23media média és marketing ügynökségtől. Kitölti a jelentkezési űrlapot a látogató adataival; a beküldést a látogató hagyja jóvá. A 23media 24 órán belül válaszol."
            className="flex flex-col gap-7 sm:gap-12"
          >
            {/* honeypot — a field no real visitor sees or fills */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Fax
                <input
                  type="text"
                  name="fax"
                  tabIndex={-1}
                  autoComplete="off"
                  toolparamdescription="Spamszűrő mező: mindig hagyd üresen."
                />
              </label>
            </div>

            {/* 1–2 · Vezetéknév, Keresztnév */}
            <p data-consult-row className={`${SENTENCE} translate-y-4 opacity-0`}>
              <span>Szia,</span>
              <input
                name="lastName"
                toolparamdescription="A jelentkező vezetékneve."
                type="text"
                required
                minLength={2}
                autoComplete="family-name"
                placeholder="vezetéknév"
                defaultValue={values.lastName}
                aria-label="Vezetéknév"
                className={`${FIELD} flex-[1_0_60%] sm:w-[12ch] sm:flex-initial`}
              />
              <input
                name="firstName"
                toolparamdescription="A jelentkező keresztneve."
                type="text"
                required
                minLength={2}
                autoComplete="given-name"
                placeholder="keresztnév"
                defaultValue={values.firstName}
                aria-label="Keresztnév"
                className={`${FIELD} flex-[1_0_60%] sm:w-[12ch] sm:flex-initial`}
              />
              <span>vagyok.</span>
            </p>

            {/* 3 · Email cím */}
            <p data-consult-row className={`${SENTENCE} translate-y-4 opacity-0`}>
              <span>Elérsz itt:</span>
              <input
                name="email"
                toolparamdescription="E-mail cím, ahová a 23media válaszol."
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="te@email.hu"
                defaultValue={values.email}
                aria-label="Email cím"
                className={`${FIELD} flex-[1_0_14ch]`}
              />
            </p>

            {/* 4 · Cégnév — nem kötelező, personal brandnél lehet, hogy nincs */}
            <p data-consult-row className={`${SENTENCE} translate-y-4 opacity-0`}>
              <span>A cégem:</span>
              <span className={OPTIONAL_FIELD}>
                <input
                  name="company"
                toolparamdescription="Cégnév — nem kötelező (personal brandnél lehet, hogy nincs)."
                  type="text"
                  autoComplete="organization"
                  placeholder="cégnév"
                  defaultValue={values.company}
                  aria-label="Cégnév (nem kötelező)"
                  className={`${FIELD} w-full`}
                />
                <span className={OPTIONAL}>nem kötelező</span>
              </span>
            </p>

            {/* 5 · Milyen telefonszámon hívhatunk? */}
            <p data-consult-row className={`${SENTENCE} translate-y-4 opacity-0`}>
              <span>Hívhatsz itt:</span>
              <input
                name="phone"
                toolparamdescription="Telefonszám előhívóval, például +36 30 123 4567."
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="+36 30 123 4567"
                defaultValue={values.phone}
                aria-label="Milyen telefonszámon hívhatunk?"
                className={`${FIELD} flex-[1_0_14ch] sm:flex-[1_0_17ch]`}
              />
            </p>

            {/* 6 · Mivel foglalkozol? */}
            <div data-consult-row className="translate-y-4 opacity-0">
              <label htmlFor="consult-occupation" className={SENTENCE}>
                Ezzel foglalkozom:
              </label>
              <textarea
                id="consult-occupation"
                name="occupation"
                toolparamdescription="Pár szóban: mivel foglalkozik a jelentkező és kiknek (legfeljebb 300 karakter)."
                required
                minLength={2}
                rows={2}
                maxLength={300}
                placeholder="Pár szóban: mit csinálsz és kiknek — pl. „coach vagyok, vezetőknek segítek”."
                defaultValue={values.occupation}
                aria-label="Mivel foglalkozol?"
                className={`${FIELD} mt-2 block w-full resize-none text-[clamp(1.1rem,1.6vw,1.35rem)] leading-relaxed max-sm:field-sizing-content max-sm:min-h-[calc(2lh+0.75rem+1px)] sm:mt-4`}
              />
            </div>

            {/* 7 · Weboldal címed — nem kötelező */}
            <p data-consult-row className={`${SENTENCE} translate-y-4 opacity-0`}>
              <span>A weboldalam:</span>
              <span className={OPTIONAL_FIELD}>
                <input
                  name="website"
                toolparamdescription="A jelentkező weboldalának címe — nem kötelező."
                  type="text"
                  autoComplete="url"
                  inputMode="url"
                  placeholder="weboldalad.hu"
                  defaultValue={values.website}
                  aria-label="Weboldal címed (nem kötelező)"
                  className={`${FIELD} w-full`}
                />
                <span className={OPTIONAL}>nem kötelező</span>
              </span>
            </p>

            <div data-consult-row className="translate-y-4 opacity-0">
              {/* the privacy checkbox, then the button — stacked at every width:
                  side by side, the three-line text squeezed the button's
                  wrapper (global `min-width: 0`) and ran under the button */}
              <div className="flex flex-col gap-6 sm:gap-8">
                <label className="flex max-w-xl cursor-pointer items-start gap-3.5 text-[13.5px] leading-relaxed text-bone-dim sm:text-[14px]">
                  <input
                    type="checkbox"
                    name="privacy"
                    required
                    defaultChecked={values.privacy}
                    toolparamdescription="Kötelező adatkezelési nyilatkozat: a látogató tudomásul veszi az Adatkezelési Tájékoztatót. Csak a látogató kifejezett jóváhagyásával jelöld be; ha nem kérdezted meg, hagyd üresen, és beküldés előtt ő jelöli be."
                    className="mt-[0.2em] h-[1.05rem] w-[1.05rem] shrink-0 cursor-pointer accent-accent"
                  />
                  {/* the checklist's sentence as an acknowledgment — see CONSULT_PRIVACY_ACK.
                      The notice opens in a new tab so the filled-in form survives. */}
                  <span>
                    {CONSULT_PRIVACY_ACK.before}
                    <Link
                      href={PAGES.privacy.path}
                      target="_blank"
                      rel="privacy-policy noopener"
                      className="text-bone underline decoration-accent/60 underline-offset-2 transition-colors hover:text-accent"
                    >
                      {CONSULT_PRIVACY_ACK.link}
                    </Link>
                    {CONSULT_PRIVACY_ACK.after}
                  </span>
                </label>
                <Magnetic strength={0.4}>
                  <button
                    type="submit"
                    disabled={pending}
                    className="group flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-full bg-accent py-3.5 pl-6 pr-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-bone disabled:cursor-wait disabled:opacity-70 sm:inline-flex sm:w-auto sm:justify-start sm:py-5 sm:pl-9 sm:tracking-[0.2em]"
                  >
                    {pending ? "Küldés…" : "Kérem a konzultációt"}
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-45">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                      >
                        <path
                          d="M7 17L17 7M17 7H8M17 7V16"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </Magnetic>
              </div>

              {state.status === "error" && (
                <p
                  role="alert"
                  className="mt-6 flex items-center gap-3 text-[14px] text-accent"
                >
                  <span className="h-px w-6 bg-accent" />
                  {state.message}
                </p>
              )}
            </div>
          </form>
        )}
      </div>

      <Steps stacked className="max-sm:mt-4 lg:hidden" />
    </section>
  );
}
