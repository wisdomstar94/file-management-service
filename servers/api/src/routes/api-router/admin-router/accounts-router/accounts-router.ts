import type {
  ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API,
  ADMIN_ACCOUNT_LIST_API,
} from "@fms/api-schemas/schemas/admin-account-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import { hashPassword } from "@fms/password-handler/passwords/hash-password";
import { Router } from "express";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { conflictError } from "#/utils/conflict-error/index.js";
import { generateCommonRes } from "#/utils/generate-common-res/index.js";
import { notFoundError } from "#/utils/not-found-error/index.js";
import { parseRequest } from "#/utils/parse-request/index.js";
import { readAdmin } from "#/utils/read-admin/index.js";
import { readPagination } from "#/utils/read-pagination/index.js";
import { readUuidParam } from "#/utils/read-uuid-param/index.js";
import {
  createAdminAccountRequestSchema,
  updateAdminAccountRequestSchema,
} from "#/validators/admin-account-validators/index.js";
import { toAdminAccountResponse } from "./_utils/to-admin-account-response/index.js";
import { assertAssignableGroups } from "./_validators/assert-assignable-groups/index.js";

const router = Router();
const relations = { permissionGroup: true, accessPolicyGroup: true };
const repository = () => appDataSource.getRepository(AdminAccountEntity);

async function findAccountOrThrow(id: string) {
  const account = await repository().findOne({ where: { id }, relations });
  if (!account) {
    throw notFoundError("관리자 계정");
  }
  return account;
}

router.get("/", requirePermission("account.access"), async (req, res) => {
  const { page, size, skip, take } = readPagination(req);
  const [accounts, total] = await repository().findAndCount({ relations, order: { createdAt: "DESC" }, skip, take });
  const body: ResBody<typeof ADMIN_ACCOUNT_LIST_API>["data"] = {
    items: accounts.map(toAdminAccountResponse),
    total,
    page,
    size,
  };
  res.json(generateCommonRes(body));
});

router.post("/", requirePermission("account.create"), async (req, res) => {
  const { password, ...body } = parseRequest(createAdminAccountRequestSchema, req.body);
  await assertAssignableGroups(appDataSource.manager, body);
  if (await repository().exists({ where: { loginId: body.loginId } })) {
    throw conflictError("이미 사용 중인 아이디입니다.");
  }

  const saved = await repository().save(repository().create({ ...body, passwordHash: await hashPassword(password) }));
  res.status(201).json(generateCommonRes(toAdminAccountResponse(await findAccountOrThrow(saved.id))));
});

// 계정 생성 · 수정 모달의 선택지. 그룹 관리 권한이 없어도 이름은 볼 수 있어야 한다.
router.get("/assignable-groups", requirePermission("account.access"), async (_, res) => {
  const select = { id: true, name: true } as const;
  const order = { createdAt: "ASC" } as const;
  const body: ResBody<typeof ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API>["data"] = {
    permissionGroups: await appDataSource.getRepository(PermissionGroupEntity).find({ select, order }),
    accessPolicyGroups: await appDataSource.getRepository(AccessPolicyGroupEntity).find({ select, order }),
  };
  res.json(generateCommonRes(body));
});

router.get("/:id", requirePermission("account.access"), async (req, res) => {
  res.json(generateCommonRes(toAdminAccountResponse(await findAccountOrThrow(readUuidParam(req, "id")))));
});

router.patch("/:id", requirePermission("account.update"), async (req, res) => {
  const id = readUuidParam(req, "id");
  const { password, ...body } = parseRequest(updateAdminAccountRequestSchema, req.body);
  await findAccountOrThrow(id);
  await assertAssignableGroups(appDataSource.manager, body);

  await repository().update(id, { ...body, ...(password ? { passwordHash: await hashPassword(password) } : {}) });
  res.json(generateCommonRes(toAdminAccountResponse(await findAccountOrThrow(id))));
});

router.delete("/:id", requirePermission("account.delete"), async (req, res) => {
  const id = readUuidParam(req, "id");
  if (readAdmin(req).account.id === id) {
    throw conflictError("로그인한 계정은 삭제할 수 없습니다.");
  }
  await findAccountOrThrow(id);
  await repository().delete(id);
  res.status(204).end();
});

export const accountsRouter = router;
