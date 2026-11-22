import { handleRpc, rpcError } from "../lib/mcp";

// The MCP endpoint (Streamable HTTP, stateless). See lib/mcp.ts.
// Public, read-only data, so any origin may call it — the DNS-rebinding
// Origin check the spec asks of *local* servers protects nothing here.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

const MAX_BODY = 64 * 1024;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { ...CORS, "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY) return json(rpcError(null, -32600, "Request too large"), 413);

  let msg: unknown;
  try {
    msg = JSON.parse(text);
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }

  // Batches were dropped from the protocol in 2025-06-18, but older clients
  // may still send them; answering each costs nothing.
  if (Array.isArray(msg)) {
    if (msg.length === 0) return json(rpcError(null, -32600, "Invalid Request"), 400);
    const replies = msg.map(handleRpc).filter((r) => r !== null);
    return replies.length ? json(replies) : new Response(null, { status: 202, headers: CORS });
  }

  const reply = handleRpc(msg);
  return reply ? json(reply) : new Response(null, { status: 202, headers: CORS });
}

// No server-initiated stream: the transport says to answer GET with 405.
export function GET() {
  return new Response(
    "23media MCP szerver (Streamable HTTP). JSON-RPC üzenetet POST-tal küldj ide; leírás: /mcp/server-card\n",
    { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS", "Content-Type": "text/plain; charset=utf-8" } },
  );
}

// Nothing to tear down without sessions.
export function DELETE() {
  return new Response(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Max-Age": "86400" } });
}
