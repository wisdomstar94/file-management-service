import { Router } from "express";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { conflictError } from "#/utils/commons/conflict-error/index.js";
import { generateCommonRes } from "#/utils/commons/generate-common-res/index.js";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import {
  createAccessPolicyGroupRequestSchema,
  updateAccessPolicyGroupRequestSchema,
} from "#/validators/access-policy-group-validators/index.js";
import { countAccessPolicyGroupUsage } from "./_services/count-access-policy-group-usage/index.js";
import { findAccessPolicyGroupOrThrow } from "./_services/find-access-policy-group-or-throw/index.js";
import { toAccessPolicyGroupDetailResponse } from "./_services/to-access-policy-group-detail-response/index.js";
import { getAccessPolicyGroupRepository } from "./_utils/get-access-policy-group-repository/index.js";
import { toAccessPolicyGroupSummaryResponse } from "./_utils/to-access-policy-group-response/index.js";

const router = Router();
router.get("/", requirePermission("policy.access"), async (_, res) => {
  const groups = await getAccessPolicyGroupRepository().find({ order: { createdAt: "ASC" } });
  res.json(generateCommonRes(groups.map(toAccessPolicyGroupSummaryResponse)));
});

router.post("/", requirePermission("policy.create"), async (req, res) => {
  const body = parseRequest(createAccessPolicyGroupRequestSchema, req.body);
  res
    .status(201)
    .json(
      generateCommonRes(
        await toAccessPolicyGroupDetailResponse(
          await getAccessPolicyGroupRepository().save(getAccessPolicyGroupRepository().create(body)),
        ),
      ),
    );
});

router.get("/:id", requirePermission("policy.access"), async (req, res) => {
  res.json(
    generateCommonRes(
      await toAccessPolicyGroupDetailResponse(await findAccessPolicyGroupOrThrow(readUuidParam(req, "id"))),
    ),
  );
});

router.patch("/:id", requirePermission("policy.update"), async (req, res) => {
  const group = await findAccessPolicyGroupOrThrow(readUuidParam(req, "id"));
  const body = parseRequest(updateAccessPolicyGroupRequestSchema, req.body);
  await getAccessPolicyGroupRepository().save(Object.assign(group, body));
  res.json(generateCommonRes(await toAccessPolicyGroupDetailResponse(await findAccessPolicyGroupOrThrow(group.id))));
});

router.delete("/:id", requirePermission("policy.delete"), async (req, res) => {
  const group = await findAccessPolicyGroupOrThrow(readUuidParam(req, "id"));
  const { usedAccountCount, usedShareLinkCount } = await countAccessPolicyGroupUsage(appDataSource.manager, group.id);
  if (usedAccountCount + usedShareLinkCount > 0) {
    throw conflictError(
      `이 접근 정책 그룹을 쓰는 계정 ${usedAccountCount}개 · 공개 링크 ${usedShareLinkCount}개가 있어 삭제할 수 없습니다.`,
    );
  }
  await getAccessPolicyGroupRepository().delete(group.id);
  res.status(204).end();
});

export const accessPolicyGroupsRouter = router;
