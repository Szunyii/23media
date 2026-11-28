import type { MetadataRoute } from "next";
import { PAGES, SITE_URL, type PageKey } from "./lib/site";

// Generated at build, so `lastModified` is the date of the deploy.
// Every page in PAGES (lib/site.ts) is listed.
const RANK: Record<PageKey, Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">> = {
  home: { changeFrequency: "monthly", priority: 1 },
  consultation: { changeFrequency: "yearly", priority: 0.8 },
  about: { changeFrequency: "monthly", priority: 0.7 },
  contact: { changeFrequency: "yearly", priority: 0.6 },
  privacy: { changeFrequency: "yearly", priority: 0.3 },
  terms: { changeFrequency: "yearly", priority: 0.3 },
  cookies: { changeFrequency: "yearly", priority: 0.3 },
  imprint: { changeFrequency: "yearly", priority: 0.3 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return (Object.keys(PAGES) as PageKey[]).map((key) => ({
    url: PAGES[key].path === "/" ? SITE_URL : `${SITE_URL}${PAGES[key].path}`,
    lastModified,
    ...RANK[key],
  }));
}
