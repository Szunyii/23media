import { NextResponse, type NextRequest } from "next/server";

/**
 * Content negotiation for AI agents, in front of every HTML page:
 *  - `Accept: text/markdown` (preferred over text/html) gets the page's
 *    Markdown version instead of the HTML, at the same URL;
 *  - `/index.md`, `/rolunk.md`, … always give the Markdown;
 *  - every page response advertises its Markdown twin, llms.txt and the MCP
 *    server card in an RFC 8288 `Link` header.
 * The Markdown itself is built by app/md/[page]/route.ts.
 *
 * Keep PAGE_PATHS and the matcher in step with PAGES in app/lib/site.ts
 * (the matcher has to be a literal, so it can't be derived).
 */
const PAGE_PATHS = new Set([
  "/",
  "/rolunk",
  "/kapcsolat",
  "/konzultacio",
  "/adatvedelem",
  "/aszf",
  "/cookie-szabalyzat",
  "/impresszum",
]);

const slugOf = (path: string) => (path === "/" ? "index" : path.slice(1));
const markdownPath = (path: string) => `/${slugOf(path)}.md`;

/** q-value of the first media range in `accept` that `match` accepts (0 if none). */
function quality(accept: string, match: (type: string) => boolean): number {
  let best = 0;
  for (const range of accept.split(",")) {
    const [type, ...params] = range.trim().toLowerCase().split(";");
    if (!match(type.trim())) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    best = Math.max(best, q ? Number(q.slice(2)) || 0 : 1);
  }
  return best;
}

/** Markdown only when asked for by name and liked at least as much as HTML —
 *  browsers (text/html, …, *\/*) never get it. */
function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const md = quality(accept, (t) => t === "text/markdown" || t === "text/x-markdown");
  return md > 0 && md >= quality(accept, (t) => t === "text/html");
}

/** Hand the request to the Markdown route; `negotiated` tells it the answer
 *  shares its URL with the HTML (so it must not be cached publicly). */
function toMarkdown(request: NextRequest, path: string, negotiated: boolean) {
  const headers = new Headers(request.headers);
  headers.delete("x-markdown-negotiated");
  if (negotiated) headers.set("x-markdown-negotiated", "1");
  return NextResponse.rewrite(new URL(`/md/${slugOf(path)}`, request.url), { request: { headers } });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const readable = request.method === "GET" || request.method === "HEAD";

  if (pathname.endsWith(".md")) {
    const path = pathname === "/index.md" ? "/" : pathname.slice(0, -3);
    return readable && PAGE_PATHS.has(path) ? toMarkdown(request, path, false) : NextResponse.next();
  }

  if (!PAGE_PATHS.has(pathname)) return NextResponse.next();

  if (readable && wantsMarkdown(request.headers.get("accept"))) {
    return toMarkdown(request, pathname, true);
  }

  const res = NextResponse.next();
  res.headers.set(
    "Link",
    [
      `<${markdownPath(pathname)}>; rel="alternate"; type="text/markdown"`,
      `</llms.txt>; rel="describedby"; type="text/plain"`,
      `</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"`,
    ].join(", "),
  );
  return res;
}

export const config = {
  matcher: [
    "/",
    "/rolunk",
    "/kapcsolat",
    "/konzultacio",
    "/adatvedelem",
    "/aszf",
    "/cookie-szabalyzat",
    "/impresszum",
    "/:slug.md",
  ],
};
