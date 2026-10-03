import { mkdirSync } from "node:fs";
import path from "node:path";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { apiEnv } from "../../utils/api-env/index.js";
import { HttpError } from "../../utils/http-error/index.js";
import { STORAGE_ROOT_DIR } from "../../utils/storage-driver/index.js";

const TEMP_DIR = path.join(STORAGE_ROOT_DIR, ".tmp");
mkdirSync(TEMP_DIR, { recursive: true });

const upload = multer({
  dest: TEMP_DIR,
  // 한글 파일명이 latin1 로 깨지지 않게 multipart 헤더를 utf8 로 읽는다.
  defParamCharset: "utf8",
  limits: { fileSize: apiEnv.maxUploadSizeMb * 1024 * 1024, files: 1 },
}).single("file");

/** `file` 필드의 파일 1개를 임시 폴더에 받는다. 파일이 없으면 400. */
export function uploadFileMiddleware(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, `파일 업로드에 실패했습니다. (${err.code})`));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    if (!req.file) {
      next(new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "파일을 선택하세요."));
      return;
    }
    next();
  });
}
