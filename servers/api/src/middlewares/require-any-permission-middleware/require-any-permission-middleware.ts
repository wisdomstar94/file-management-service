import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { PermissionCode } from "@fms/common-utils/permissions/permission-code-registry";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { readAdmin } from "#/utils/read-admin/index.js";

/** 권한 그룹에 넘긴 코드 중 하나도 없으면 403. */
export function requireAnyPermission(codes: PermissionCode[]) {
  return (req: Request, _: Response, next: NextFunction) => {
    const { permissionCodes } = readAdmin(req);
    if (!codes.some((code) => permissionCodes.has(code))) {
      throw new HttpError(403, API_ERROR_CODE.PERMISSION_DENIED, "이 기능을 사용할 권한이 없습니다.");
    }
    next();
  };
}
