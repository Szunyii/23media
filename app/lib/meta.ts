import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_BASE,
  PAGES,
  SITE_NAME,
  markdownPath,
  type PageKey,
} from "./site";

/**
 * Metadata every page sets for itself: its canonical URL, the Markdown twin
 * (`<link rel="alternate" type="text/markdown">`, for agents) and the Open
 * Graph fields (see OPEN_GRAPH_BASE for why each page spreads them).
 * `title` goes through the layout's "%s — 23media" template.
 *
 * The preview image is the shared card (DEFAULT_OG_IMAGE), unless the page
 * ships its own opengraph-image file — then pass `ownImage: true`, because
 * `openGraph.images` set here would win over that file.
 */
export function pageMetadata(
  key: PageKey,
  description: string,
  title: string = PAGES[key].title,
  { ownImage = false }: { ownImage?: boolean } = {},
): Metadata {
  const path = PAGES[key].path;
  return {
    title,
    description,
    alternates: { canonical: path, types: { "text/markdown": markdownPath(path) } },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      url: path,
      title: `${title} — ${SITE_NAME}`,
      description,
      ...(ownImage ? {} : { images: [DEFAULT_OG_IMAGE] }),
    },
  };
}
