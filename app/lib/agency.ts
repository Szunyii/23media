/**
 * Facts about the agency as plain data, for machines: the MCP endpoint
 * (app/mcp), the in-browser WebMCP tools (components/WebMcp.tsx) and the
 * schema.org graph. Client-safe — imports only copy and constants.
 */
import { CONSULT, FOUNDER, MANIFESTO, PERSONAL_BRANDING, PB_PILLARS, SERVICES, STATS, plain } from "./content";
import {
  CONTACT_EMAIL,
  PAGES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SLOGAN,
  SITE_URL,
  markdownPath,
  type PageKey,
} from "./site";

export const absUrl = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

export function servicesData() {
  return {
    services: SERVICES.map((s) => ({
      id: s.id,
      title: s.title,
      description: plain(s.desc),
      includes: s.items.map((i) => plain([i])),
    })),
    featured: {
      id: "personal-branding",
      title: PERSONAL_BRANDING.title,
      description: `${PERSONAL_BRANDING.lead} ${PERSONAL_BRANDING.body}`,
      pillars: PB_PILLARS.map((p) => ({ title: p.title, description: plain(p.desc) })),
    },
  };
}

export function contactData() {
  return {
    email: CONTACT_EMAIL,
    consultation: {
      url: absUrl(PAGES.consultation.path),
      summary: CONSULT.description,
      price: "ingyenes",
      steps: CONSULT.steps.map((s) => ({ title: s.t, description: s.d })),
      requiredFields: [
        "vezetéknév",
        "keresztnév",
        "e-mail cím",
        "telefonszám",
        "foglalkozás",
        "adatkezelési jelölőnégyzet (az Adatkezelési Tájékoztató tudomásulvétele, a látogató jelöli be)",
      ],
      optionalFields: ["cégnév", "weboldal"],
    },
    note: "A 23media e-mailben vagy a konzultációs űrlapon érhető el. A cégadatok (23 Media Kft., székhely, cégjegyzékszám, adószám) az impresszumban vannak.",
    pages: {
      contact: absUrl(PAGES.contact.path),
      imprint: absUrl(PAGES.imprint.path),
      terms: absUrl(PAGES.terms.path),
      privacy: absUrl(PAGES.privacy.path),
      cookies: absUrl(PAGES.cookies.path),
    },
  };
}

export function overviewData() {
  return {
    name: SITE_NAME,
    url: SITE_URL,
    slogan: SITE_SLOGAN,
    description: SITE_DESCRIPTION,
    language: "hu-HU",
    manifesto: `${MANIFESTO.lead} ${MANIFESTO.body}`,
    founder: { name: FOUNDER.name, roles: FOUNDER.roles },
    figures: STATS.map((s) => ({ value: `${s.value}${s.plus ? "+" : ""}`, label: s.label })),
    services: SERVICES.map((s) => s.title).concat(PERSONAL_BRANDING.title),
    email: CONTACT_EMAIL,
    consultation: absUrl(PAGES.consultation.path),
    pages: pagesData(),
  };
}

export function pagesData() {
  return (Object.keys(PAGES) as PageKey[]).map((key) => ({
    key,
    title: PAGES[key].title,
    url: absUrl(PAGES[key].path),
    markdown: `${SITE_URL}${markdownPath(PAGES[key].path)}`,
  }));
}
