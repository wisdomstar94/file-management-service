import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import type { Express, NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/http-error/index.js";

export function globalErrorHandlerMiddleware(props: { app: Express }) {
  const { app } = props;

  app.use((err: unknown, req: Request, res: Response, _: NextFunction) => {
    if (err instanceof HttpError) {
      const body: ApiFailBody = { error: { code: err.code, message: err.message, details: err.details } };
      res.status(err.status).json(body);
      return;
    }

    const requestKey = crypto.randomUUID();
    console.error(`[${requestKey}] globalErrorHandlerMiddleware.req.originalUrl`, req.originalUrl);
    console.error(`[${requestKey}] globalErrorHandlerMiddleware.err`, err);

    const body: ApiFailBody = {
      error: {
        code: API_ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: "서버에서 오류가 발생했습니다.",
        requestKey,
      },
    };
    res.status(500).json(body);
  });
}
