import type { Request } from "express";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { paginationQuerySchema } from "#/validators/pagination-query-validators/index.js";

export function readPagination(req: Request) {
  const { page, size } = parseRequest(paginationQuerySchema, req.query);
  return { page, size, skip: (page - 1) * size, take: size };
}
