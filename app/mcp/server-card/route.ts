import { serverCard } from "../../lib/mcp";

// The MCP Server Card. Lives next to the endpoint (SEP-2127 puts it at
// `<endpoint>/server-card`); next.config.ts also serves it at
// /.well-known/mcp/server-card.json, where SEP-1649 clients look.
export const dynamic = "force-static";

export function GET() {
  return Response.json(serverCard(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Expose-Headers": "ETag",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
