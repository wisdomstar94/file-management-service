import {
  createPermissionGroupRequestSchema,
  updatePermissionGroupRequestSchema,
} from "@fms/api-schemas/requests/permission-group-request-schemas";
import type { PermissionGroupSummaryResponse } from "@fms/api-schemas/responses/permission-group-responses";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import { Router } from "express";
import { In } from "typeorm";
import { requirePermission } from "../../../../middlewares/require-permission-middleware/index.js";
import { appDataSource } from "../../../../utils/app-data-source/index.js";
import { conflictError } from "../../../../utils/conflict-error/index.js";
import { generateCommonRes } from "../../../../utils/generate-common-res/index.js";
import { HttpError } from "../../../../utils/http-error/index.js";
import { notFoundError } from "../../../../utils/not-found-error/index.js";
import { parseRequest } from "../../../../utils/parse-request/index.js";
import { readUuidParam } from "../../../../utils/read-uuid-param/index.js";
import { toPermissionResponse } from "../_utils/to-permission-response/index.js";
import {
  toPermissionGroupDetailResponse,
  toPermissionGroupSummaryResponse,
} from "./_utils/to-permission-group-response/index.js";

const router = Router();
const repository = () => appDataSource.getRepository(PermissionGroupEntity);

async function findGroupOrThrow(id: string) {
  const group = await repository().findOne({ where: { id }, relations: { permissions: true } });
  if (!group) {
    throw notFoundError("권한 그룹");
  }
  return group;
}

async function findPermissionsOrThrow(permissionIds: string[]) {
  const permissions = await appDataSource.getRepository(PermissionEntity).findBy({ id: In(permissionIds) });
  if (permissions.length !== new Set(permissionIds).size) {
    throw new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "존재하지 않는 권한이 포함되어 있습니다.");
  }
  return permissions;
}

router.get("/", requirePermission("perm.group.access"), async (_, res) => {
  const groups = await repository().find({ relations: { permissions: true }, order: { createdAt: "ASC" } });
  const body: PermissionGroupSummaryResponse[] = groups.map((group) =>
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
  const saved = await repository().save(repository().create({ name, permissions }));
  res.status(201).json(generateCommonRes(toPermissionGroupDetailResponse(await findGroupOrThrow(saved.id))));
});

router.get("/:id", requirePermission("perm.group.access"), async (req, res) => {
  res.json(generateCommonRes(toPermissionGroupDetailResponse(await findGroupOrThrow(readUuidParam(req, "id")))));
});

router.patch("/:id", requirePermission("perm.group.update"), async (req, res) => {
  const { name, permissionIds } = parseRequest(updatePermissionGroupRequestSchema, req.body);
  const group = await findGroupOrThrow(readUuidParam(req, "id"));
  if (name !== undefined) {
    group.name = name;
  }
  if (permissionIds !== undefined) {
    group.permissions = await findPermissionsOrThrow(permissionIds);
  }
  await repository().save(group);
  res.json(generateCommonRes(toPermissionGroupDetailResponse(await findGroupOrThrow(group.id))));
});

router.delete("/:id", requirePermission("perm.group.delete"), async (req, res) => {
  const group = await findGroupOrThrow(readUuidParam(req, "id"));
  const usedAccountCount = await appDataSource
    .getRepository(AdminAccountEntity)
    .countBy({ permissionGroupId: group.id });
  if (usedAccountCount > 0) {
    throw conflictError(`이 권한 그룹이 할당된 계정이 ${usedAccountCount}개 있어 삭제할 수 없습니다.`);
  }
  await repository().delete(group.id);
  res.status(204).end();
});

export const permissionGroupsRouter = router;
