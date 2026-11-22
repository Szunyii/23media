/**
 * Markdown versions of every page, for AI agents: served for
 * `Accept: text/markdown` (see proxy.ts), at the `.md` URLs (`/index.md`,
 * `/rolunk.md`, …), as the MCP resources (app/mcp) and stitched together as
 * llms-full.txt. Built from the same copy as the HTML (lib/content.ts,
 * lib/legal.ts), so the two can't drift apart.
 */
import {
  CONSULT,
  FOUNDER,
  MANIFESTO,
  PB_PILLARS,
  PERSONAL_BRANDING,
  SERVICES,
  STATS,
  plain,
} from "./content";
import { LEGAL_DOCS, type LegalDoc } from "./legal";
import {
  CONTACT_EMAIL,
  PAGES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SLOGAN,
  SITE_TITLE,
  SITE_URL,
  markdownPath,
  type PageKey,
} from "./site";
import { GROUPS } from "./testimonials";

const abs = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);
/** Site-relative links in the shared copy become absolute — an agent may read
 *  the text far from the page it came from. */
const absLinks = (s: string) => s.replace(/\]\(\//g, `](${SITE_URL}/`);
const pageLink = (key: PageKey, text: string = PAGES[key].title) => `[${text}](${abs(PAGES[key].path)})`;

/** Rough token count (≈4 characters per token) for the x-markdown-tokens header. */
export const estimateTokens = (md: string) => Math.ceil(md.length / 4);

export const CONTACT_HEADLINE = "Elindult benned valami és szeretnél róla beszélni?";

function nav(current: PageKey): string {
  const links = (Object.keys(PAGES) as PageKey[])
    .filter((k) => k !== current)
    .map((k) => `[${PAGES[k].title}](${SITE_URL}${markdownPath(PAGES[k].path)})`);
  return [
    "---",
    "",
    `${SITE_NAME} · ${SITE_URL} · ${CONTACT_EMAIL}`,
    "",
    `További oldalak (Markdown): ${links.join(" · ")}`,
    "",
    `Összefoglaló AI-ügynököknek: ${SITE_URL}/llms.txt`,
    "",
  ].join("\n");
}

const servicesSection = () =>
  [
    "## Szolgáltatások",
    "",
    ...SERVICES.flatMap((s) => [
      `### ${s.n} — ${s.title}`,
      "",
      plain(s.desc),
      "",
      `Részterületek: ${s.items.map((i) => plain([i])).join(", ")}`,
      "",
    ]),
  ].join("\n");

const personalBrandingSection = () =>
  [
    `## Kiemelt szolgáltatás: ${PERSONAL_BRANDING.title}`,
    "",
    `**${PERSONAL_BRANDING.lead}**`,
    "",
    PERSONAL_BRANDING.body,
    "",
    ...PB_PILLARS.map((p) => `${Number(p.n)}. **${p.title}** — ${plain(p.desc)}`),
    "",
    "Hiteles és önazonos kommunikáció.",
    "",
  ].join("\n");

const manifestoSection = () =>
  [
    "## Kiáltvány",
    "",
    `**${MANIFESTO.lead}**`,
    "",
    MANIFESTO.body,
    "",
    ...MANIFESTO.points.map((p) => `- ${p}`),
    "",
  ].join("\n");

const statsSection = () =>
  [
    "## Számokban",
    "",
    ...STATS.map((s) => `- **${s.value}${s.plus ? "+" : ""}** — ${s.label}`),
    "",
  ].join("\n");

const testimonialsSection = () =>
  [
    "## Ügyfeleink írták",
    "",
    ...GROUPS.flatMap((g) => [
      `### ${g.label} — ${g.tagline}`,
      "",
      ...g.items.flatMap((t) => [
        `> ${t.quote}`,
        `>`,
        `> — **${t.name}**${t.company ? `, ${t.company}` : ""}${t.role ? ` (${t.role})` : ""}${t.url ? ` — ${t.url}` : ""}`,
        "",
      ]),
    ]),
  ].join("\n");

const founderSection = () =>
  [
    `## Alapító: ${FOUNDER.name}`,
    "",
    FOUNDER.roles.join(" · "),
    "",
    "### Levél a vállalkozóknak",
    "",
    `„${FOUNDER.lead.before}${FOUNDER.lead.accent}”`,
    "",
    ...FOUNDER.letter.flatMap((p) => [`${p.lead ? `**${p.lead}**` : ""}${plain(p.body)}`, ""]),
    FOUNDER.closing.replace(/ /g, " "),
    "",
    `— ${FOUNDER.name}, alapító · 23 Media`,
    "",
  ].join("\n");

const consultSteps = () =>
  CONSULT.steps.map((s) => `${Number(s.n)}. **${s.t}** — ${s.d}`).join("\n");

function home(): string {
  return [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_SLOGAN}`,
    "",
    SITE_DESCRIPTION,
    "",
    `- Weboldal: ${SITE_URL}`,
    `- E-mail: ${CONTACT_EMAIL}`,
    `- ${pageLink("consultation")}: ${CONSULT.description}`,
    "",
    manifestoSection(),
    servicesSection(),
    personalBrandingSection(),
    testimonialsSection(),
    statsSection(),
    founderSection(),
    "## Kapcsolat",
    "",
    `**${CONTACT_HEADLINE}**`,
    "",
    `- E-mail: ${CONTACT_EMAIL}`,
    `- ${pageLink("consultation")} — ${CONSULT.description}`,
    `- ${pageLink("about")} · ${pageLink("contact")} · ${pageLink("privacy")} · ${pageLink("terms")} · ${pageLink("imprint")}`,
    "",
    nav("home"),
  ].join("\n");
}

function about(): string {
  return [
    `# Rólunk — ${SITE_NAME}`,
    "",
    `> ${SITE_SLOGAN}`,
    "",
    SITE_DESCRIPTION,
    "",
    manifestoSection(),
    statsSection(),
    "## Amiben segítünk",
    "",
    ...SERVICES.map((s) => `- **${s.title}** — ${plain(s.desc)}`),
    `- **${PERSONAL_BRANDING.title}** — ${PERSONAL_BRANDING.body}`,
    "",
    founderSection(),
    `Beszéljünk: ${pageLink("consultation")} vagy ${CONTACT_EMAIL}.`,
    "",
    nav("about"),
  ].join("\n");
}

function contact(): string {
  return [
    `# Kapcsolat — ${SITE_NAME}`,
    "",
    `**${CONTACT_HEADLINE}**`,
    "",
    `- E-mail: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`,
    `- ${pageLink("consultation")}: ${CONSULT.description}`,
    "",
    "## Mi történik, ha jelentkezel",
    "",
    consultSteps(),
    "",
    "## Jogi információk",
    "",
    `- ${pageLink("imprint")} — a szolgáltató adatai`,
    `- ${pageLink("privacy")}`,
    `- ${pageLink("terms")}`,
    "",
    nav("contact"),
  ].join("\n");
}

function consultation(): string {
  return [
    `# ${CONSULT.title} — ${SITE_NAME}`,
    "",
    CONSULT.description,
    "",
    "## Jelentkezés",
    "",
    `Az űrlap: ${abs(PAGES.consultation.path)}`,
    "",
    "Mezők (* = kötelező): vezetéknév*, keresztnév*, e-mail cím*, telefonszám* (előhívóval), foglalkozás* (pár szóban), cégnév, weboldal.",
    "",
    "Böngészőben futó AI-ügynökök az űrlapot a `request_consultation` WebMCP-eszközként is kitölthetik; a beküldést a látogató hagyja jóvá.",
    "",
    "## Mi történik ezután",
    "",
    consultSteps(),
    "",
    `Inkább írnál? ${CONTACT_EMAIL}`,
    "",
    `Az adataid kezeléséről: ${pageLink("privacy")}.`,
    "",
    nav("consultation"),
  ].join("\n");
}

function legal(doc: LegalDoc, key: PageKey): string {
  const blocks = doc.sections.flatMap((s) => [
    `## ${s.h}`,
    "",
    ...s.blocks.flatMap((b) => {
      if ("p" in b) return [absLinks(b.p), ""];
      if ("ul" in b) return [...b.ul.map((li) => `- ${absLinks(li)}`), ""];
      return [...b.rows.map(([k, v]) => `- **${k}:** ${absLinks(v)}`), ""];
    }),
  ]);
  return [`# ${doc.title} — ${SITE_NAME}`, "", absLinks(doc.intro), "", ...blocks, nav(key)].join("\n");
}

const BUILDERS: Record<PageKey, () => string> = {
  home,
  about,
  contact,
  consultation,
  privacy: () => legal(LEGAL_DOCS.privacy, "privacy"),
  terms: () => legal(LEGAL_DOCS.terms, "terms"),
  imprint: () => legal(LEGAL_DOCS.imprint, "imprint"),
};

export function pageMarkdown(key: PageKey): string {
  return BUILDERS[key]();
}

/** The page key for a site path ("/", "/rolunk", …), or null. */
export function pageKeyForPath(path: string): PageKey | null {
  const hit = (Object.keys(PAGES) as PageKey[]).find((k) => PAGES[k].path === path);
  return hit ?? null;
}

/* ----------------------------------------------------------------- *
 * llms.txt (llmstxt.org): H1, a summary blockquote, then link lists.
 * ----------------------------------------------------------------- */
export function llmsTxt(): string {
  const team = STATS.find((s) => s.label === "Fős csapat");
  const md = (key: PageKey, note: string) =>
    `- [${PAGES[key].title}](${SITE_URL}${markdownPath(PAGES[key].path)}): ${note}`;
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_SLOGAN} Magyar nyelvű oldal (hu-HU). A ${SITE_NAME} ${team ? `${team.value} fős ` : ""}média és marketing ügynökség, alapítója ${FOUNDER.name} (${FOUNDER.roles.join(", ").toLowerCase()}). Kapcsolat: ${CONTACT_EMAIL}. Ajánlatkérés helyett ingyenes, 30 perces konzultációt lehet kérni: ${abs(PAGES.consultation.path)}.`,
    "",
    "Minden oldal Markdownban is elérhető: a `.md` végű címen, vagy `Accept: text/markdown` fejléccel az eredeti címen.",
    "",
    "## Oldalak",
    "",
    md("home", "szolgáltatások, kiemelt personal branding, ügyfélvélemények, számok, alapítói levél"),
    md("about", "kiáltvány, számok, szolgáltatások röviden, az alapító levele"),
    md("contact", "e-mail, ingyenes konzultáció, mi történik jelentkezés után"),
    md("consultation", "a konzultációs űrlap mezői és a folyamat"),
    "",
    "## Szolgáltatások",
    "",
    ...SERVICES.map((s) => `- [${s.title}](${SITE_URL}/index.md): ${plain(s.desc)}`),
    `- [${PERSONAL_BRANDING.title}](${SITE_URL}/index.md): ${PERSONAL_BRANDING.body}`,
    "",
    "## AI-ügynököknek",
    "",
    `- [MCP szerver](${SITE_URL}/mcp): Streamable HTTP, hitelesítés nélkül, csak olvasható eszközökkel (szolgáltatások, kapcsolat, ügyfélvélemények, oldalak Markdownban)`,
    `- [MCP Server Card](${SITE_URL}/.well-known/mcp/server-card.json): az MCP szerver leírása`,
    `- [Teljes szöveg](${SITE_URL}/llms-full.txt): az összes oldal egyetlen Markdown-fájlban`,
    "",
    "## Optional",
    "",
    md("privacy", "milyen adatokat kezelünk és miért"),
    md("terms", "a weboldal használata, AI-felhasználás (keresés és AI-válasz igen, modelltanítás nem)"),
    md("imprint", "a szolgáltató és a tárhelyszolgáltató adatai"),
    "",
  ].join("\n");
}

export function llmsFullTxt(): string {
  return (Object.keys(PAGES) as PageKey[])
    .map((k) => `<!-- ${abs(PAGES[k].path)} -->\n\n${pageMarkdown(k)}`)
    .join("\n\n");
}
