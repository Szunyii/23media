import type { MetadataRoute } from "next";
import { CONTENT_SIGNAL, SITE_URL } from "./lib/site";

// Everything on the site is public — there is no admin, account or search
// route to keep crawlers out of — so the file's job is to say so explicitly,
// to point at the sitemap, and to state how AI systems may use the content
// (Content Signals, contentsignals.org: search and AI answers yes, training no).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      other: { "Content-Signal": CONTENT_SIGNAL },
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
