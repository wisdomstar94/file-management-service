import type { RequestHeaders } from "../../evaluate-header-node.js";

export function readHeader(headers: RequestHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(", ") : value;
}
