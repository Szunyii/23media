import { llmsTxt } from "../lib/markdown";

// llms.txt (llmstxt.org) — the site summarised for language models, with
// links to the Markdown version of every page. Built from the page copy.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}
