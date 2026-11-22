import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

// Generated at build, so `lastModified` is the date of the deploy.
// A new route has to be listed here to be included.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/konzultacio`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
