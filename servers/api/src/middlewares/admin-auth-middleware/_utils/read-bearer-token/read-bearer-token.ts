import type { Request } from "express";

export function readBearerToken(req: Request): string | null {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}
