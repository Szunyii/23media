import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger builds the app with `output: "standalone"` (it injects the
  // option before `next build`). The standalone server only ships traced
  // files, so `public/` would be left out and every /clients/*, /team/*
  // image would 404 in production. Tracing the folder in makes the build
  // copy it to .next/standalone/public, which server.js serves as-is.
  outputFileTracingIncludes: {
    "/*": ["./public/**/*"],
  },
  // The MCP server card lives next to its endpoint (app/mcp/server-card);
  // SEP-1649 clients and agent-readiness scanners look for it here.
  async rewrites() {
    return [
      { source: "/.well-known/mcp/server-card.json", destination: "/mcp/server-card" },
      { source: "/.well-known/mcp.json", destination: "/mcp/server-card" },
    ];
  },
};

export default nextConfig;
