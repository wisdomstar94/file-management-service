import type { RequestHeaders } from "../../../../../../types/request-headers/index.js";

export function readHeader(headers: RequestHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(", ") : value;
}
