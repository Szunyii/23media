import type { Metadata } from "next";
import Providers from "./components/Providers";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import PersonalBranding from "./components/PersonalBranding";
import Testimonials from "./components/Testimonials";
import Stats from "./components/Stats";
import Founder from "./components/Founder";
import Contact from "./components/Contact";
import {
  CONTACT_EMAIL,
  OPEN_GRAPH_BASE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHARE_DESCRIPTION,
  SITE_SLOGAN,
  SITE_TITLE,
  SITE_URL,
} from "./lib/site";

// Title and description come from the layout's defaults.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    url: "/",
    title: SITE_TITLE,
    description: SITE_SHARE_DESCRIPTION,
  },
};

/**
 * Structured data for search engines: who runs the site and what it is called
 * (the WebSite name is what Google prints above the result's URL).
 * Only facts the page itself states. Add `telephone`, a postal `address` and
 * `sameAs` (the social profiles) here once the footer carries the real ones.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "23 Media",
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      email: CONTACT_EMAIL,
      slogan: SITE_SLOGAN,
      description: SITE_DESCRIPTION,
      founder: { "@type": "Person", name: "Engi Ádám" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: "23 Media",
      inLanguage: "hu-HU",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <Providers>
      <script
        type="application/ld+json"
        // "<" escaped so no string in the payload can close the script tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <Nav />
      <main className="relative">
        <Hero />
        <Manifesto />
        <Marquee />
        <Services />
        <PersonalBranding />
        <Testimonials />
        <Stats />
        <Founder />
        <Contact />
      </main>
    </Providers>
  );
}
