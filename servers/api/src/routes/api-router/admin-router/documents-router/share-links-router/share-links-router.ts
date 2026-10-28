import { randomBytes } from "node:crypto";
import type { SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { Router } from "express";
import { requireAnyPermission } from "#/middlewares/require-any-permission-middleware/index.js";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { generateCommonRes } from "#/utils/commons/generate-common-res/index.js";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import {
  createShareLinkRequestSchema,
  updateShareLinkRequestSchema,
} from "#/validators/share-link-validators/index.js";
import { findDocumentOrThrow } from "../_services/find-document-or-throw/index.js";
import { SHARE_LINK_RELATIONS } from "./_consts/share-link-relations/index.js";
import { findShareLinkOrThrow } from "./_services/find-share-link-or-throw/index.js";
import { toShareLinkColumns } from "./_services/to-share-link-columns/index.js";
import { getShareLinkRepository } from "./_utils/get-share-link-repository/index.js";
import { toShareLinkResponse } from "./_utils/to-share-link-response/index.js";

const router = Router({ mergeParams: true });
router.get("/", requirePermission("file.detail.access"), async (req, res) => {
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const links = await getShareLinkRepository().find({
    where: { documentId: document.id },
    relations: SHARE_LINK_RELATIONS,
    order: { createdAt: "DESC" },
  });
  res.json(generateCommonRes(links.map((link) => toShareLinkResponse(link, document))));
});

// 링크 생성 · 수정 모달의 접근 정책 그룹 선택지
router.get(
  "/assignable-access-policy-groups",
  requireAnyPermission(["file.detail.link.create", "file.detail.link.update"]),
  async (_, res) => {
    const groups: ResBody<typeof SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API>["data"][number][] = await appDataSource
      .getRepository(AccessPolicyGroupEntity)
      .find({ select: { id: true, name: true }, order: { createdAt: "ASC" } });
    res.json(generateCommonRes(groups));
  },
);

router.post("/", requirePermission("file.detail.link.create"), async (req, res) => {
  const body = parseRequest(createShareLinkRequestSchema, req.body);
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const columns = await toShareLinkColumns(appDataSource.manager, document, body);
  const saved = await getShareLinkRepository().save(
    getShareLinkRepository().create({
      ...columns,
      documentId: document.id,
      shareLinkKey: randomBytes(16).toString("base64url"),
    }),
  );
  const link = await getShareLinkRepository().findOneOrFail({
    where: { id: saved.id },
    relations: SHARE_LINK_RELATIONS,
  });
  res.status(201).json(generateCommonRes(toShareLinkResponse(link, document)));
});

router.patch("/:linkId", requirePermission("file.detail.link.update"), async (req, res) => {
  const body = parseRequest(updateShareLinkRequestSchema, req.body);
  const { document, link } = await findShareLinkOrThrow(req);
  await getShareLinkRepository().update(link.id, await toShareLinkColumns(appDataSource.manager, document, body));
  const updated = await getShareLinkRepository().findOneOrFail({
    where: { id: link.id },
    relations: SHARE_LINK_RELATIONS,
  });
  res.json(generateCommonRes(toShareLinkResponse(updated, document)));
});

router.delete("/:linkId", requirePermission("file.detail.link.delete"), async (req, res) => {
  const { link } = await findShareLinkOrThrow(req);
  await getShareLinkRepository().delete(link.id);
  res.status(204).end();
});

export const shareLinksRouter = router;
