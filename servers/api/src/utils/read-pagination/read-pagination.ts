import type { Request } from "express";
import { paginationQuerySchema } from "../../validators/pagination-query-validators/index.js";
import { parseRequest } from "../parse-request/index.js";

export function readPagination(req: Request) {
  const { page, size } = parseRequest(paginationQuerySchema, req.query);
  return { page, size, skip: (page - 1) * size, take: size };
}
