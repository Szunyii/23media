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
import JsonLd from "./components/JsonLd";
import { pageGraph } from "./lib/schema";
import {
  OPEN_GRAPH_BASE,
  SITE_DESCRIPTION,
  SITE_SHARE_DESCRIPTION,
  SITE_TITLE,
} from "./lib/site";

// Title and description come from the layout's defaults.
export const metadata: Metadata = {
  alternates: { canonical: "/", types: { "text/markdown": "/index.md" } },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    url: "/",
    title: SITE_TITLE,
    description: SITE_SHARE_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <Providers>
      {/* structured data: who runs the site, what it offers (lib/schema.ts) */}
      <JsonLd data={pageGraph("home", SITE_DESCRIPTION)} />
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
