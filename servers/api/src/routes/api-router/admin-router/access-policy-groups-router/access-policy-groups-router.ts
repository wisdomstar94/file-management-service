import type { ACCESS_POLICY_GROUP_DETAIL_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { Router } from "express";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { conflictError } from "#/utils/conflict-error/index.js";
import { generateCommonRes } from "#/utils/generate-common-res/index.js";
import { notFoundError } from "#/utils/not-found-error/index.js";
import { parseRequest } from "#/utils/parse-request/index.js";
import { readUuidParam } from "#/utils/read-uuid-param/index.js";
import {
  createAccessPolicyGroupRequestSchema,
  updateAccessPolicyGroupRequestSchema,
} from "#/validators/access-policy-group-validators/index.js";
import { countAccessPolicyGroupUsage } from "./_services/count-access-policy-group-usage/index.js";
import { toAccessPolicyGroupSummaryResponse } from "./_utils/to-access-policy-group-response/index.js";

const router = Router();
const repository = () => appDataSource.getRepository(AccessPolicyGroupEntity);

async function findGroupOrThrow(id: string) {
  const group = await repository().findOne({ where: { id } });
  if (!group) {
    throw notFoundError("접근 정책 그룹");
  }
  return group;
}

async function toDetailResponse(
  group: AccessPolicyGroupEntity,
): Promise<ResBody<typeof ACCESS_POLICY_GROUP_DETAIL_API>["data"]> {
  return {
    ...toAccessPolicyGroupSummaryResponse(group),
    ruleTree: group.ruleTree,
    ...(await countAccessPolicyGroupUsage(appDataSource.manager, group.id)),
  };
}

router.get("/", requirePermission("policy.access"), async (_, res) => {
  const groups = await repository().find({ order: { createdAt: "ASC" } });
  res.json(generateCommonRes(groups.map(toAccessPolicyGroupSummaryResponse)));
});

router.post("/", requirePermission("policy.create"), async (req, res) => {
  const body = parseRequest(createAccessPolicyGroupRequestSchema, req.body);
  res.status(201).json(generateCommonRes(await toDetailResponse(await repository().save(repository().create(body)))));
});

router.get("/:id", requirePermission("policy.access"), async (req, res) => {
  res.json(generateCommonRes(await toDetailResponse(await findGroupOrThrow(readUuidParam(req, "id")))));
});

router.patch("/:id", requirePermission("policy.update"), async (req, res) => {
  const group = await findGroupOrThrow(readUuidParam(req, "id"));
  const body = parseRequest(updateAccessPolicyGroupRequestSchema, req.body);
  await repository().save(Object.assign(group, body));
  res.json(generateCommonRes(await toDetailResponse(await findGroupOrThrow(group.id))));
});

router.delete("/:id", requirePermission("policy.delete"), async (req, res) => {
  const group = await findGroupOrThrow(readUuidParam(req, "id"));
  const { usedAccountCount, usedShareLinkCount } = await countAccessPolicyGroupUsage(appDataSource.manager, group.id);
  if (usedAccountCount + usedShareLinkCount > 0) {
    throw conflictError(
      `이 접근 정책 그룹을 쓰는 계정 ${usedAccountCount}개 · 공개 링크 ${usedShareLinkCount}개가 있어 삭제할 수 없습니다.`,
    );
  }
  await repository().delete(group.id);
  res.status(204).end();
});

export const accessPolicyGroupsRouter = router;
