import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { z } from "zod";
import { HttpError } from "../http-error/index.js";

/** 요청 본문 · 쿼리를 스키마로 검증한다. 실패하면 필드별 메시지를 담아 400 으로 응답한다. */
export function parseRequest<TSchema extends z.ZodType>(schema: TSchema, value: unknown): z.infer<TSchema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "요청 값이 올바르지 않습니다.", {
      issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  return result.data;
}
