/**
 * The bits of the WebMCP browser API we use (Chrome, behind a flag in 2026).
 * Current builds expose it as `document.modelContext`; older ones as
 * `navigator.modelContext`, whose registerTool() returned `{ unregister }`
 * instead of honouring an AbortSignal — both are handled.
 */
export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean; untrustedContentHint?: boolean };
  /** Return any JSON-serialisable value. Errors thrown here never reach the
   *  agent, so failures are returned as `{ error }`. */
  execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => unknown;
};

export type ModelContext = EventTarget & {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => unknown;
};

/** A submit triggered by an agent through a declarative (form) tool. */
export type AgentSubmitEvent = SubmitEvent & {
  agentInvoked?: boolean;
  respondWith?: (result: Promise<unknown>) => void;
};

export function getModelContext(): ModelContext | null {
  if (typeof document === "undefined") return null;
  const mc =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;
  return mc && typeof mc.registerTool === "function" ? mc : null;
}

/** Register tools until `signal` aborts. Safe to call twice (StrictMode). */
export function registerTools(mc: ModelContext, tools: WebMcpTool[], signal: AbortSignal) {
  for (const tool of tools) {
    try {
      const handle = mc.registerTool(tool, { signal });
      const legacy = handle as { unregister?: () => void } | undefined;
      if (legacy && typeof legacy.unregister === "function") {
        signal.addEventListener("abort", () => legacy.unregister?.(), { once: true });
      }
      if (handle && typeof (handle as Promise<unknown>).catch === "function") {
        (handle as Promise<unknown>).catch(() => {});
      }
    } catch {
      // already registered (a remount racing the unregister) or unsupported shape
    }
  }
}
