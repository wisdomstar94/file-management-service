import { paginationQuerySchema } from "@fms/api-schemas/requests/pagination-query-schema";
import type { Request } from "express";
import { parseRequest } from "../parse-request/index.js";

export function readPagination(req: Request) {
  const { page, size } = parseRequest(paginationQuerySchema, req.query);
  return { page, size, skip: (page - 1) * size, take: size };
}
