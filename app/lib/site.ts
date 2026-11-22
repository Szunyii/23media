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
 * Open Graph fields every page shares. `openGraph` is merged shallowly between
 * segments — a page that sets it replaces the layout's whole object — so each
 * page spreads this and adds its own `url`, `title` and `description`.
 */
export const OPEN_GRAPH_BASE = {
  siteName: SITE_NAME,
  locale: "hu_HU",
  type: "website",
} as const;
