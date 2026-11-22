/**
 * schema.org structured data (JSON-LD) for every page, as one linked graph:
 * nodes refer to each other by `@id`, so the Organization, the founder and the
 * services are described once and reused by every page.
 *
 * Only facts the site itself states. The client publishes no phone number,
 * street address or social profiles (2026-11-22), so the Organization has no
 * `telephone`, `address` or `sameAs` — add them here if that changes.
 */
import { absUrl } from "./agency";
import { CONSULT, FOUNDER, PERSONAL_BRANDING, SERVICES, STATS, plain } from "./content";
import {
  COMPANY,
  CONTACT_EMAIL,
  PAGES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SLOGAN,
  SITE_URL,
  type PageKey,
} from "./site";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const FOUNDER_ID = `${SITE_URL}/#founder`;
const CATALOG_ID = `${SITE_URL}/#services`;
const pageId = (path: string) => `${absUrl(path)}#webpage`;
const serviceId = (id: string) => `${SITE_URL}/#service-${id}`;

type Node = Record<string, unknown>;

const teamSize = Number(STATS.find((s) => s.label === "Fős csapat")?.value) || undefined;

function organization(): Node {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: "23 Media",
    ...(COMPANY.legalName ? { legalName: COMPANY.legalName } : {}),
    ...(COMPANY.taxNumber ? { taxID: COMPANY.taxNumber } : {}),
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
    image: `${SITE_URL}/opengraph-image`,
    email: CONTACT_EMAIL,
    slogan: SITE_SLOGAN,
    description: SITE_DESCRIPTION,
    founder: { "@id": FOUNDER_ID },
    ...(teamSize ? { numberOfEmployees: { "@type": "QuantitativeValue", value: teamSize } } : {}),
    knowsLanguage: "hu",
    knowsAbout: [...SERVICES.map((s) => s.title), PERSONAL_BRANDING.title],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: CONTACT_EMAIL,
      url: absUrl(PAGES.contact.path),
      availableLanguage: ["hu"],
    },
    hasOfferCatalog: { "@id": CATALOG_ID },
    publishingPrinciples: absUrl(PAGES.terms.path),
  };
}

function website(): Node {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: "23 Media",
    description: SITE_DESCRIPTION,
    inLanguage: "hu-HU",
    publisher: { "@id": ORG_ID },
  };
}

function founder(): Node {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: FOUNDER.name,
    jobTitle: FOUNDER.roles.join(", "),
    image: `${SITE_URL}${FOUNDER.portrait}`,
    worksFor: { "@id": ORG_ID },
    url: absUrl(PAGES.about.path),
  };
}

function services(): Node[] {
  const all = [
    ...SERVICES.map((s) => ({
      id: s.id,
      name: s.title,
      description: plain(s.desc),
      types: s.items.map((i) => plain([i])),
    })),
    {
      id: "personal-branding",
      name: PERSONAL_BRANDING.title,
      description: `${PERSONAL_BRANDING.lead} ${PERSONAL_BRANDING.body}`,
      types: ["Önismeret", "Feltárás", "Stratégia és script"],
    },
  ];
  const consultation: Node = {
    "@type": "Service",
    "@id": serviceId("konzultacio"),
    name: CONSULT.title,
    description: CONSULT.description,
    provider: { "@id": ORG_ID },
    url: absUrl(PAGES.consultation.path),
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "HUF",
      url: absUrl(PAGES.consultation.path),
    },
  };
  return [
    {
      "@type": "OfferCatalog",
      "@id": CATALOG_ID,
      name: "Szolgáltatások",
      itemListElement: [...all.map((s) => ({ "@id": serviceId(s.id) })), { "@id": serviceId("konzultacio") }],
    },
    ...all.map((s) => ({
      "@type": "Service",
      "@id": serviceId(s.id),
      name: s.name,
      description: s.description,
      serviceType: s.types,
      provider: { "@id": ORG_ID },
      url: `${SITE_URL}/#services`,
    })),
    consultation,
  ];
}

const PAGE_TYPE: Partial<Record<PageKey, string>> = {
  about: "AboutPage",
  contact: "ContactPage",
};

function webPage(key: PageKey, description: string): Node {
  const { path, title } = PAGES[key];
  return {
    "@type": PAGE_TYPE[key] ?? "WebPage",
    "@id": pageId(path),
    url: absUrl(path),
    name: key === "home" ? `${SITE_NAME} — ${SITE_SLOGAN}` : `${title} — ${SITE_NAME}`,
    description,
    inLanguage: "hu-HU",
    isPartOf: { "@id": SITE_ID },
    ...(key === "home" || key === "about" ? { about: { "@id": ORG_ID } } : {}),
    ...(key === "about" ? { mainEntity: { "@id": ORG_ID } } : {}),
    ...(key === "contact" ? { mainEntity: { "@id": ORG_ID } } : {}),
    ...(key !== "home" ? { breadcrumb: { "@id": `${absUrl(path)}#breadcrumb` } } : {}),
  };
}

function breadcrumb(key: PageKey): Node {
  const { path, title } = PAGES[key];
  return {
    "@type": "BreadcrumbList",
    "@id": `${absUrl(path)}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: PAGES.home.title, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: absUrl(path) },
    ],
  };
}

/** The JSON-LD document for a page. Pages about the business carry the full
 *  Organization; legal pages only reference it. */
export function pageGraph(key: PageKey, description: string): Node {
  const full = key === "home" || key === "about" || key === "contact" || key === "consultation";
  const graph: Node[] = [webPage(key, description), website(), organization()];
  if (key !== "home") graph.push(breadcrumb(key));
  if (full) graph.push(founder(), ...services());
  return { "@context": "https://schema.org", "@graph": graph };
}
