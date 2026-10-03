import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import type { EntityManager } from "typeorm";
import { HttpError } from "../../../../../../utils/http-error/index.js";

/** 계정에 지정하려는 권한 그룹 · 접근 정책 그룹이 실제로 있는지 확인한다. */
export async function assertAssignableGroups(
  manager: EntityManager,
  props: { permissionGroupId?: string; accessPolicyGroupId?: string },
): Promise<void> {
  const isMissingPermissionGroup =
    props.permissionGroupId !== undefined &&
    !(await manager.getRepository(PermissionGroupEntity).exists({ where: { id: props.permissionGroupId } }));
  const isMissingAccessPolicyGroup =
    props.accessPolicyGroupId !== undefined &&
    !(await manager.getRepository(AccessPolicyGroupEntity).exists({ where: { id: props.accessPolicyGroupId } }));
  if (isMissingPermissionGroup || isMissingAccessPolicyGroup) {
    throw new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "존재하지 않는 권한 그룹 또는 접근 정책 그룹입니다.");
  }
}
