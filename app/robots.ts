import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

// Everything on the site is public — there is no admin, account or search
// route to keep crawlers out of — so the file's job is to say so explicitly
// and to point at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
