import { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { Router } from "express";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { uploadFileMiddleware } from "#/middlewares/upload-file-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { storageDriver } from "#/singleton-classes/storage-driver/index.js";
import { conflictError } from "#/utils/commons/conflict-error/index.js";
import { generateCommonRes } from "#/utils/commons/generate-common-res/index.js";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import { sendVersionFile } from "#/utils/domains/document-version/send-version-file/index.js";
import {
  createDocumentVersionRequestSchema,
  updateDocumentVersionRequestSchema,
} from "#/validators/document-validators/index.js";
import { findDocumentOrThrow } from "../_services/find-document-or-throw/index.js";
import { saveUploadedVersion } from "../_services/save-uploaded-version/index.js";
import { toDocumentDetailResponse } from "../_utils/to-document-detail-response/index.js";
import { findDocumentVersionOrThrow } from "./_services/find-document-version-or-throw/index.js";

const router = Router({ mergeParams: true });

router.post("/", requirePermission("file.detail.version.create"), uploadFileMiddleware, async (req, res) => {
  const { versionName } = parseRequest(createDocumentVersionRequestSchema, req.body);
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const file = req.file as Express.Multer.File;
  await appDataSource.transaction((manager) =>
    saveUploadedVersion(manager, { documentId: document.id, versionName, file }),
  );
  res
    .status(201)
    .json(generateCommonRes(toDocumentDetailResponse(await findDocumentOrThrow(appDataSource.manager, document.id))));
});

router.patch("/:versionId", requirePermission("file.detail.version.update"), async (req, res) => {
  const { versionName } = parseRequest(updateDocumentVersionRequestSchema, req.body);
  const { document, version } = await findDocumentVersionOrThrow(req);
  await appDataSource.getRepository(DocumentVersionEntity).update(version.id, { versionName });
  res.json(generateCommonRes(toDocumentDetailResponse(await findDocumentOrThrow(appDataSource.manager, document.id))));
});

router.delete("/:versionId", requirePermission("file.detail.version.update"), async (req, res) => {
  const { document, version } = await findDocumentVersionOrThrow(req);
  if (document.versions.length === 1) {
    throw conflictError("자료에는 버전이 1개 이상 있어야 합니다. 자료를 삭제하세요.");
  }

  // 이 버전을 기본으로 지정한 자료 · 링크는 「자료 설정 / 최신 버전 따름」 으로 되돌린다.
  await appDataSource.transaction(async (manager) => {
    await manager.getRepository(DocumentEntity).update({ defaultVersionId: version.id }, { defaultVersionId: null });
    await manager
      .getRepository(ShareLinkEntity)
      .update({ fixedVersionId: version.id }, { fixedVersionId: null, defaultVersionMode: "FOLLOW_DOCUMENT" });
    await manager.getRepository(DocumentVersionEntity).delete(version.id);
  });
  await storageDriver.delete(version.storageKey);
  res.json(generateCommonRes(toDocumentDetailResponse(await findDocumentOrThrow(appDataSource.manager, document.id))));
});

router.get("/:versionId/download", requirePermission("file.detail.access"), async (req, res) => {
  const { version } = await findDocumentVersionOrThrow(req);
  sendVersionFile(res, version);
});

export const versionsRouter = router;
