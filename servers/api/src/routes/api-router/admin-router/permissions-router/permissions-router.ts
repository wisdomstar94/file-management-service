import type { PERMISSION_LIST_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { PERMISSION_CODES } from "@fms/common-utils/permissions/permission-code-registry";
import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import { Router } from "express";
import { requirePermission } from "../../../../middlewares/require-permission-middleware/index.js";
import { appDataSource } from "../../../../utils/app-data-source/index.js";
import { generateCommonRes } from "../../../../utils/generate-common-res/index.js";
import { notFoundError } from "../../../../utils/not-found-error/index.js";
import { parseRequest } from "../../../../utils/parse-request/index.js";
import { readUuidParam } from "../../../../utils/read-uuid-param/index.js";
import { updatePermissionRequestSchema } from "../../../../validators/permission-validators/index.js";
import { toPermissionResponse } from "../_utils/to-permission-response/index.js";

const router = Router();
const repository = () => appDataSource.getRepository(PermissionEntity);

async function findPermissionOrThrow(id: string) {
  const permission = await repository().findOne({ where: { id } });
  if (!permission) {
    throw notFoundError("권한");
  }
  return permission;
}

router.get("/", requirePermission("perm.access"), async (_, res) => {
  const permissions = await repository().find({ order: { category: "ASC", createdAt: "ASC" } });
  const storedCodes = new Set(permissions.map((permission) => permission.code));
  const body: ResBody<typeof PERMISSION_LIST_API>["data"] = {
    items: permissions.map(toPermissionResponse),
    codeOnlyPermissionCodes: PERMISSION_CODES.filter((code) => !storedCodes.has(code)),
  };
  res.json(generateCommonRes(body));
});

router.get("/:id", requirePermission("perm.access"), async (req, res) => {
  res.json(generateCommonRes(toPermissionResponse(await findPermissionOrThrow(readUuidParam(req, "id")))));
});

router.patch("/:id", requirePermission("perm.update"), async (req, res) => {
  const id = readUuidParam(req, "id");
  const body = parseRequest(updatePermissionRequestSchema, req.body);
  await findPermissionOrThrow(id);

  await repository().update(id, body);
  res.json(generateCommonRes(toPermissionResponse(await findPermissionOrThrow(id))));
});

export const permissionsRouter = router;
