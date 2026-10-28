import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import { In } from "typeorm";
import { HttpError } from "#/classes/http-error/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

export async function findPermissionsOrThrow(permissionIds: string[]) {
  const permissions = await appDataSource.getRepository(PermissionEntity).findBy({ id: In(permissionIds) });
  if (permissions.length !== new Set(permissionIds).size) {
    throw new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "존재하지 않는 권한이 포함되어 있습니다.");
  }
  return permissions;
}
