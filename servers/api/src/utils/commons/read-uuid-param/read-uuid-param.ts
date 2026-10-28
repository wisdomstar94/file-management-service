import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { Request } from "express";
import { z } from "zod";
import { HttpError } from "#/classes/http-error/index.js";

/** 경로의 식별키가 uuid 가 아니면 DB 를 조회하지 않고 404 로 응답한다. */
export function readUuidParam(req: Request, name: string): string {
  const value = req.params[name];
  if (!z.uuid().safeParse(value).success) {
    throw new HttpError(404, API_ERROR_CODE.NOT_FOUND, "대상을 찾을 수 없습니다.");
  }
  return String(value);
}
