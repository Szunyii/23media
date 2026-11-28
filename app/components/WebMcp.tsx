"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { contactData, overviewData, pagesData, servicesData } from "../lib/agency";
import { scrollToSection } from "../lib/sections";
import { PAGES, type PageKey } from "../lib/site";
import { getModelContext, registerTools, type WebMcpTool } from "../lib/webmcp";

/** Home-page sections an agent can scroll to, by their DOM ids. */
const SECTIONS = { services: "services", references: "work", founder: "founder" } as const;
type SectionKey = keyof typeof SECTIONS;

const DESTINATIONS = [...(Object.keys(PAGES) as PageKey[]), ...(Object.keys(SECTIONS) as SectionKey[])];

/**
 * WebMCP tools for AI agents running in the visitor's browser, registered on
 * every page as soon as it loads (the layout mounts this once, so client-side
 * navigation keeps them). Read-only facts plus navigation; asking for a
 * consultation is the form's own declarative tool on /konzultacio, so the
 * visitor sees and confirms what is sent.
 */
export default function WebMcp() {
  const router = useRouter();

  useEffect(() => {
    const mc = getModelContext();
    if (!mc) return;

    const tools: WebMcpTool[] = [
      {
        name: "get_agency_info",
        description:
          "A 23media média és marketing ügynökség adatai. topic: overview (bemutatkozás, alapító, számok), services (szolgáltatások részletesen), contact (e-mail, ingyenes konzultáció menete), pages (az oldal aloldalai és Markdown-változataik).",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              enum: ["overview", "services", "contact", "pages"],
              description: "Melyik adatcsoport kell. Alapértelmezés: overview.",
            },
          },
        },
        annotations: { readOnlyHint: true },
        execute: (input) => {
          switch (input?.topic ?? "overview") {
            case "services":
              return servicesData();
            case "contact":
              return contactData();
            case "pages":
              return { pages: pagesData() };
            case "overview":
              return overviewData();
            default:
              return { error: "Ismeretlen topic. Lehetséges: overview, services, contact, pages." };
          }
        },
      },
      {
        name: "open_page",
        description:
          "Megnyitja a 23media.hu egy oldalát vagy a főoldal egy szakaszát a látogató böngészőjében. Oldalak: home, about (rólunk), contact (kapcsolat), consultation (ingyenes konzultáció űrlap), privacy (adatkezelés), terms (ÁSZF), cookies (cookie szabályzat), imprint (impresszum). Főoldali szakaszok: services, references, founder.",
        inputSchema: {
          type: "object",
          properties: {
            destination: { type: "string", enum: DESTINATIONS, description: "Hová navigáljon." },
          },
          required: ["destination"],
        },
        execute: (input) => {
          const dest = input?.destination;
          if (typeof dest === "string" && dest in SECTIONS) {
            const id = SECTIONS[dest as SectionKey];
            if (window.location.pathname === "/") scrollToSection(id);
            else router.push(`/#${id}`);
            return { ok: true, opened: `${PAGES.home.path}#${id}` };
          }
          if (typeof dest === "string" && dest in PAGES) {
            const path = PAGES[dest as PageKey].path;
            router.push(path);
            return { ok: true, opened: path, title: PAGES[dest as PageKey].title };
          }
          return { error: `Ismeretlen cél. Lehetséges: ${DESTINATIONS.join(", ")}.` };
        },
      },
    ];

    const controller = new AbortController();
    registerTools(mc, tools, controller.signal);
    return () => controller.abort();
  }, [router]);

  return null;
}
