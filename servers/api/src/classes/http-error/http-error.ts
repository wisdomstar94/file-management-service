import type { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";

/** 라우터에서 던지면 global-error-middleware 가 `status` 와 `{ error: { code, message, details } }` 로 응답한다. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE],
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}
