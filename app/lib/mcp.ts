/**
 * A small, read-only MCP server (Model Context Protocol, Streamable HTTP
 * transport) at /mcp, described by the server card at /mcp/server-card
 * (also served at /.well-known/mcp/server-card.json).
 *
 * Stateless: no sessions, no server-sent events — every POST carries one
 * JSON-RPC message and gets a JSON reply (or 202 for a notification), which
 * the transport allows. Everything it returns is public page content, so it
 * needs no auth; it has no write tools on purpose (a consultation request goes
 * through the form, where the visitor confirms it).
 */
import { contactData, overviewData, pagesData, servicesData } from "./agency";
import { pageMarkdown } from "./markdown";
import { GROUPS } from "./testimonials";
import { PAGES, SITE_DESCRIPTION, SITE_NAME, SITE_URL, markdownPath, type PageKey } from "./site";

export const MCP_VERSION = "1.0.0";
export const MCP_ENDPOINT = `${SITE_URL}/mcp`;
/** Newest first; the first is offered when the client asks for one we don't know. */
export const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS =
  "A 23media magyar média és marketing ügynökség nyilvános adatai: szolgáltatások, kapcsolat, ügyfélvélemények és az oldalak Markdown-változata. Minden eszköz csak olvas. Konzultációt a látogató a https://23media.hu/konzultacio űrlapon kérhet; telefonszámot és postacímet az ügynökség nem tesz közzé.";

const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

type Json = Record<string, unknown>;
type ToolResult = { content: { type: "text"; text: string }[]; structuredContent?: Json; isError?: boolean };

const asJson = (data: Json): ToolResult => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  structuredContent: data,
});

const TOOLS: {
  name: string;
  title: string;
  description: string;
  inputSchema: Json;
  run: (args: Json) => ToolResult;
}[] = [
  {
    name: "get_agency_overview",
    title: "Az ügynökség röviden",
    description:
      "A 23media alapadatai: leírás, szlogen, kiáltvány, alapító, számok (ügyfelek, videók, csapatméret), szolgáltatások listája, kapcsolat és az oldalak címei.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => asJson(overviewData()),
  },
  {
    name: "list_services",
    title: "Szolgáltatások",
    description:
      "A 23media öt szolgáltatási területe (márka és arculat, web és rendszerfejlesztés, tartalomgyártás, hirdetés és növekedés, social management) részterületekkel, valamint a kiemelt personal branding szolgáltatás.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => asJson(servicesData()),
  },
  {
    name: "get_contact_info",
    title: "Kapcsolat és konzultáció",
    description:
      "Hogyan lehet elérni a 23mediát: e-mail cím, az ingyenes 30 perces konzultáció menete és űrlapmezői, valamint az impresszum és a jogi oldalak címei.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => asJson(contactData()),
  },
  {
    name: "get_testimonials",
    title: "Ügyfélvélemények",
    description: "A 23media ügyfeleinek szó szerinti véleményei (személyes márkák és cégek), névvel és cégnévvel.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () =>
      asJson({
        groups: GROUPS.map((g) => ({
          kind: g.id,
          label: g.label,
          testimonials: g.items.map((t) => ({
            name: t.name,
            company: t.company ?? null,
            role: t.role ?? null,
            url: t.url ?? null,
            quote: t.quote,
          })),
        })),
      }),
  },
  {
    name: "get_page",
    title: "Oldal Markdownban",
    description:
      "A 23media.hu egy oldalának teljes szövege Markdownban. Oldalak: home (főoldal), about (rólunk), contact (kapcsolat), consultation (ingyenes konzultáció), privacy (adatkezelési tájékoztató), terms (ÁSZF, általános szerződési feltételek), cookies (cookie szabályzat), imprint (impresszum).",
    inputSchema: {
      type: "object",
      properties: { page: { type: "string", enum: PAGE_KEYS, description: "Az oldal azonosítója." } },
      required: ["page"],
      additionalProperties: false,
    },
    run: (args) => {
      const page = args.page;
      if (typeof page !== "string" || !PAGE_KEYS.includes(page as PageKey)) {
        return {
          content: [{ type: "text", text: `Ismeretlen oldal. Lehetséges értékek: ${PAGE_KEYS.join(", ")}.` }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: pageMarkdown(page as PageKey) }] };
    },
  },
];

const resourceUri = (key: PageKey) => `${SITE_URL}${markdownPath(PAGES[key].path)}`;

type RpcId = string | number | null;
type RpcResponse =
  | { jsonrpc: "2.0"; id: RpcId; result: unknown }
  | { jsonrpc: "2.0"; id: RpcId; error: { code: number; message: string } };

export const rpcError = (id: RpcId, code: number, message: string): RpcResponse => ({
  jsonrpc: "2.0",
  id,
  error: { code, message },
});

/** Handle one JSON-RPC message; `null` for notifications (no reply). */
export function handleRpc(msg: unknown): RpcResponse | null {
  if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
    return rpcError(null, -32600, "Invalid Request");
  }
  const { jsonrpc, id, method, params } = msg as {
    jsonrpc?: unknown;
    id?: unknown;
    method?: unknown;
    params?: unknown;
  };
  const validId = typeof id === "string" || typeof id === "number";
  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return rpcError(validId ? id : null, -32600, "Invalid Request");
  }
  // A message without an id is a notification (initialized, cancelled, …):
  // nothing to do for a stateless server, and it gets no reply.
  if (id === undefined) return null;
  if (!validId) return rpcError(null, -32600, "Invalid Request");

  const p = (params && typeof params === "object" ? params : {}) as Json;
  const ok = (result: unknown): RpcResponse => ({ jsonrpc: "2.0", id, result });

  switch (method) {
    case "initialize": {
      const asked = typeof p.protocolVersion === "string" ? p.protocolVersion : "";
      return ok({
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
        },
        serverInfo: { name: SITE_NAME, title: SITE_NAME, version: MCP_VERSION, websiteUrl: SITE_URL },
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({
        tools: TOOLS.map(({ name, title, description, inputSchema }) => ({
          name,
          title,
          description,
          inputSchema,
          annotations: { title, ...READ_ONLY },
        })),
      });
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === p.name);
      if (!tool) return rpcError(id, -32602, `Unknown tool: ${String(p.name)}`);
      const args = (p.arguments && typeof p.arguments === "object" ? p.arguments : {}) as Json;
      return ok(tool.run(args));
    }
    case "resources/list":
      return ok({
        resources: PAGE_KEYS.map((key) => ({
          uri: resourceUri(key),
          name: key,
          title: PAGES[key].title,
          description: `${PAGES[key].title} — a 23media.hu oldal Markdown-változata.`,
          mimeType: "text/markdown",
        })),
      });
    case "resources/templates/list":
      return ok({ resourceTemplates: [] });
    case "resources/read": {
      const key = PAGE_KEYS.find((k) => resourceUri(k) === p.uri);
      if (!key) return rpcError(id, -32002, `Resource not found: ${String(p.uri)}`);
      return ok({ contents: [{ uri: resourceUri(key), mimeType: "text/markdown", text: pageMarkdown(key) }] });
    }
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

/**
 * The MCP Server Card. Two generations of the format in one document, since
 * clients and scanners read different ones:
 *  - SEP-2127 (current): `$schema`, reverse-DNS `name`, `version`,
 *    `description` (≤ 100 chars), `remotes[]`;
 *  - SEP-1649 (what /.well-known/mcp/server-card.json checkers expect):
 *    `serverInfo`, `transport.endpoint`, `capabilities`.
 */
export function serverCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "hu.23media/site",
    title: SITE_NAME,
    version: MCP_VERSION,
    description: "A 23media média és marketing ügynökség nyilvános adatai: szolgáltatások, kapcsolat, vélemények.",
    websiteUrl: SITE_URL,
    icons: [{ src: `${SITE_URL}/icon-512.png`, mimeType: "image/png", sizes: ["512x512"] }],
    remotes: [{ type: "streamable-http", url: MCP_ENDPOINT, supportedProtocolVersions: PROTOCOL_VERSIONS }],

    protocolVersion: PROTOCOL_VERSIONS[0],
    serverInfo: { name: SITE_NAME, title: SITE_NAME, version: MCP_VERSION },
    transport: { type: "streamable-http", endpoint: MCP_ENDPOINT },
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
    },
    authentication: { required: false, schemes: [] },
    instructions: INSTRUCTIONS,
    longDescription: SITE_DESCRIPTION,
    tools: TOOLS.map(({ name, title, description }) => ({ name, title, description })),
    resources: pagesData().map((p) => ({ uri: p.markdown, name: p.key, title: p.title, mimeType: "text/markdown" })),
  };
}
