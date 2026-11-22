import type { NextRequest } from "next/server";
import { estimateTokens, pageKeyForPath, pageMarkdown } from "../../lib/markdown";
import { SITE_URL } from "../../lib/site";

// Markdown version of each page. Not linked directly: proxy.ts rewrites the
// public `.md` URLs (`/index.md`, `/rolunk.md`, …) and `Accept: text/markdown`
// requests for a page here.
//
// Rendered per request (it's string building, nothing to wait for) so the
// caching headers below are ours: a prerendered route gets Next's
// `s-maxage=31536000` whatever it sets. That matters for the negotiated
// answer — it shares its URL with the HTML, and Next drops `Vary` from the
// prerendered HTML, so a shared cache must never store the Markdown there or
// it could hand it to browsers.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const path = page === "index" ? "/" : `/${page}`;
  const key = pageKeyForPath(path);
  if (!key) return new Response("Not found\n", { status: 404 });

  const negotiated = request.headers.get("x-markdown-negotiated") === "1";
  const md = pageMarkdown(key);
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(estimateTokens(md)),
      // the HTML page is the one to index; this is its plain-text twin
      Link: `<${path === "/" ? SITE_URL : SITE_URL + path}>; rel="canonical"`,
      Vary: "Accept",
      "Cache-Control": negotiated ? "private, no-cache" : "public, max-age=3600",
    },
  });
}
