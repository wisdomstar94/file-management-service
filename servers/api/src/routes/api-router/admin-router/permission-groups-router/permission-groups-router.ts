import type { PERMISSION_GROUP_LIST_API } from "@fms/api-schemas/schemas/permission-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import { Router } from "express";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { conflictError } from "#/utils/commons/conflict-error/index.js";
import { generateCommonRes } from "#/utils/commons/generate-common-res/index.js";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import {
  createPermissionGroupRequestSchema,
  updatePermissionGroupRequestSchema,
} from "#/validators/permission-group-validators/index.js";
import { toPermissionResponse } from "../_utils/to-permission-response/index.js";
import { findPermissionGroupOrThrow } from "./_services/find-permission-group-or-throw/index.js";
import { findPermissionsOrThrow } from "./_services/find-permissions-or-throw/index.js";
import { toPermissionGroupDetailResponse } from "./_utils/domains/permission-group-response/to-permission-group-detail-response/index.js";
import { toPermissionGroupSummaryResponse } from "./_utils/domains/permission-group-response/to-permission-group-summary-response/index.js";
import { getPermissionGroupRepository } from "./_utils/get-permission-group-repository/index.js";

const router = Router();
router.get("/", requirePermission("perm.group.access"), async (_, res) => {
  const groups = await getPermissionGroupRepository().find({
    relations: { permissions: true },
    order: { createdAt: "ASC" },
  });
  const body: ResBody<typeof PERMISSION_GROUP_LIST_API>["data"][number][] = groups.map((group) =>
    toPermissionGroupSummaryResponse(group, group.permissions?.length ?? 0),
  );
  res.json(generateCommonRes(body));
});

// 권한 그룹 상세의 체크 목록. 권한 관리 권한이 없어도 그룹에 넣을 권한은 볼 수 있어야 한다.
router.get("/assignable-permissions", requirePermission("perm.group.access"), async (_, res) => {
  const permissions = await appDataSource
    .getRepository(PermissionEntity)
    .find({ order: { category: "ASC", createdAt: "ASC" } });
  res.json(generateCommonRes(permissions.map(toPermissionResponse)));
});

router.post("/", requirePermission("perm.group.create"), async (req, res) => {
  const { name, permissionIds } = parseRequest(createPermissionGroupRequestSchema, req.body);
  const permissions = await findPermissionsOrThrow(permissionIds);
  const saved = await getPermissionGroupRepository().save(getPermissionGroupRepository().create({ name, permissions }));
  res.status(201).json(generateCommonRes(toPermissionGroupDetailResponse(await findPermissionGroupOrThrow(saved.id))));
});

router.get("/:id", requirePermission("perm.group.access"), async (req, res) => {
  res.json(
    generateCommonRes(toPermissionGroupDetailResponse(await findPermissionGroupOrThrow(readUuidParam(req, "id")))),
  );
});

router.patch("/:id", requirePermission("perm.group.update"), async (req, res) => {
  const { name, permissionIds } = parseRequest(updatePermissionGroupRequestSchema, req.body);
  const group = await findPermissionGroupOrThrow(readUuidParam(req, "id"));
  if (name !== undefined) {
    group.name = name;
  }
  if (permissionIds !== undefined) {
    group.permissions = await findPermissionsOrThrow(permissionIds);
  }
  await getPermissionGroupRepository().save(group);
  res.json(generateCommonRes(toPermissionGroupDetailResponse(await findPermissionGroupOrThrow(group.id))));
});

router.delete("/:id", requirePermission("perm.group.delete"), async (req, res) => {
  const group = await findPermissionGroupOrThrow(readUuidParam(req, "id"));
  const usedAccountCount = await appDataSource
    .getRepository(AdminAccountEntity)
    .countBy({ permissionGroupId: group.id });
  if (usedAccountCount > 0) {
    throw conflictError(`이 권한 그룹이 할당된 계정이 ${usedAccountCount}개 있어 삭제할 수 없습니다.`);
  }
  await getPermissionGroupRepository().delete(group.id);
  res.status(204).end();
});

export const permissionGroupsRouter = router;
