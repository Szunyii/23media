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
 * The company behind the site: the company table of the lawyer's documents
 * (Adatkezelési tájékoztató and ÁSZF, 2026-10-05), word for word except the
 * e-mail. It fills that table on the privacy notice and the ÁSZF, the
 * Impresszum and the Kapcsolat page's legal line.
 *
 * The phone number and the seat appear on the legal pages because the
 * documents list them. The marketing surfaces stay as the client chose on
 * 2026-11-22: no phone, street address or social profiles in the schema.org
 * Organization, the footer or the agent APIs.
 */
export const COMPANY = {
  legalName: "23 Media Korlátolt Felelősségű Társaság",
  shortName: "23 Media Kft.",
  seat: "6724 Szeged, Kossuth Lajos sugárút 72. B. ép.",
  registrationNumber: "06-09-029324",
  /** Not in the documents: the "06" of the registration number is the Szeged court. */
  registry: "Szegedi Törvényszék Cégbírósága",
  taxNumber: "32456510-2-06",
  representative: "Engi Ádám ügyvezető",
  /**
   * The documents give the managing director's private address; the site
   * gives the company mailbox everywhere instead — tables, the privacy and
   * cookie contact lines (asked for 2026-11-28).
   */
  email: CONTACT_EMAIL,
  phone: "+36 20 323 0797",
} as const;

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
  // was /felhasznalasi-feltetelek (a draft) until the ÁSZF arrived; next.config redirects it
  terms: { path: "/aszf", title: "ÁSZF" },
  cookies: { path: "/cookie-szabalyzat", title: "Cookie szabályzat" },
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

/** Alt text of the shared preview card (app/opengraph-image.tsx). */
export const OG_IMAGE_ALT = `23media — média és marketing ügynökség. ${SITE_SLOGAN}`;

/**
 * The shared preview card, as config metadata. A file-based opengraph-image
 * only fills the image of its own segment: a page below it that sets
 * `openGraph` replaces the layout's object, image included, and Next puts no
 * image back — so pageMetadata (lib/meta.ts) adds this one explicitly.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: OG_IMAGE_ALT,
} as const;
