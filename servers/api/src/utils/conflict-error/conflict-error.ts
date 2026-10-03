import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { HttpError } from "../http-error/index.js";

export function conflictError(message: string): HttpError {
  return new HttpError(409, API_ERROR_CODE.CONFLICT, message);
}
