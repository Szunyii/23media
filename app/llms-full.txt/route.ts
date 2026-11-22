import { llmsFullTxt } from "../lib/markdown";

// Every page's Markdown in one file, for agents that want it all at once.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}
