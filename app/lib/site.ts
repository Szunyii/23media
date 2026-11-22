/**
 * Site identity shared by everything that describes the site to crawlers and
 * link previews: page metadata, robots.txt, sitemap.xml, the web manifest,
 * the Open Graph cards and the JSON-LD on the home page.
 *
 * The wording is lifted from the page itself (hero eyebrow + slogan, Manifesto,
 * the Services titles) so a search result or a shared link says what the
 * visitor then actually finds.
 */
export const SITE_URL = "https://23media.hu";
export const SITE_NAME = "23media";
export const SITE_TITLE = "23media — Média és marketing ügynökség";
export const SITE_SLOGAN = "Tervezéstől a kivitelezésig, egy kézben!";
export const SITE_DESCRIPTION =
  "Média és marketing ügynökség, ahol a teljes kommunikációd egy kézben van: márka és arculat, web, tartalomgyártás, hirdetés és social management.";
/** Shorter line for link previews, where the card image carries the brand. */
export const SITE_SHARE_DESCRIPTION = `${SITE_SLOGAN} Márka és arculat · Web · Tartalom · Hirdetés · Social management.`;
export const CONTACT_EMAIL = "23@23media.hu";

/**
 * How AI systems may use the content (contentsignals.org), declared in
 * robots.txt: show up in search and in AI answers, but no model training.
 */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";

/**
 * The company behind the site, for the Impresszum and the privacy notice
 * (the data controller). Copy the values from the company registry extract.
 * A field left `null` is simply not shown — never put a placeholder here.
 *
 * The client chose not to publish a phone number or a street address
 * (2026-11-22), so the schema.org Organization carries neither and there is no
 * `sameAs` (no social profiles). The registered seat is still required in the
 * Impresszum by law (Ekertv. 4. §).
 */
export const COMPANY: {
  /** e.g. "23media Kft." */
  legalName: string | null;
  /** registered seat (székhely) */
  seat: string | null;
  /** cégjegyzékszám, or the sole-trader registration number */
  registrationNumber: string | null;
  /** e.g. "Fővárosi Törvényszék Cégbírósága" */
  registry: string | null;
  /** adószám */
  taxNumber: string | null;
} = {
  legalName: null,
  seat: null,
  registrationNumber: null,
  registry: null,
  taxNumber: null,
};

/** Hosting and the 23@23media.hu mailbox both run at Hostinger (MX: mx1/mx2.hostinger.com). */
export const HOSTING_PROVIDER = {
  name: "Hostinger International Ltd.",
  address: "61 Lordou Vironos Street, 6023 Larnaca, Ciprus",
  url: "https://www.hostinger.com",
} as const;

/**
 * Every HTML page of the site. Drives the sitemap, the footer links, the
 * Markdown versions (`/index.md`, `/rolunk.md`, …), llms.txt and the WebMCP
 * `open_page` tool. A new page has to be added here (and to the proxy matcher).
 */
export const PAGES = {
  home: { path: "/", title: "Főoldal" },
  about: { path: "/rolunk", title: "Rólunk" },
  contact: { path: "/kapcsolat", title: "Kapcsolat" },
  consultation: { path: "/konzultacio", title: "Ingyenes konzultáció" },
  privacy: { path: "/adatvedelem", title: "Adatkezelési tájékoztató" },
  terms: { path: "/felhasznalasi-feltetelek", title: "Felhasználási feltételek" },
  imprint: { path: "/impresszum", title: "Impresszum" },
} as const;

export type PageKey = keyof typeof PAGES;

/** The Markdown twin of a page: "/" → "/index.md", "/rolunk" → "/rolunk.md". */
export const markdownPath = (path: string) => (path === "/" ? "/index.md" : `${path}.md`);

/**
 * Open Graph fields every page shares. `openGraph` is merged shallowly between
 * segments — a page that sets it replaces the layout's whole object — so each
 * page spreads this and adds its own `url`, `title` and `description`.
 */
export const OPEN_GRAPH_BASE = {
  siteName: SITE_NAME,
  locale: "hu_HU",
  type: "website",
} as const;
