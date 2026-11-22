import type { Metadata } from "next";
import { OPEN_GRAPH_BASE, PAGES, SITE_NAME, markdownPath, type PageKey } from "./site";

/**
 * Metadata every page sets for itself: its canonical URL, the Markdown twin
 * (`<link rel="alternate" type="text/markdown">`, for agents) and the Open
 * Graph fields (see OPEN_GRAPH_BASE for why each page spreads them).
 * `title` goes through the layout's "%s — 23media" template.
 */
export function pageMetadata(
  key: PageKey,
  description: string,
  title: string = PAGES[key].title,
): Metadata {
  const path = PAGES[key].path;
  return {
    title,
    description,
    alternates: { canonical: path, types: { "text/markdown": markdownPath(path) } },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title: `${title} — ${SITE_NAME}`, description },
  };
}
