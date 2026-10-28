import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { HttpError } from "#/classes/http-error/index.js";

export function notFoundError(target: string): HttpError {
  return new HttpError(404, API_ERROR_CODE.NOT_FOUND, `${target}을(를) 찾을 수 없습니다.`);
}
