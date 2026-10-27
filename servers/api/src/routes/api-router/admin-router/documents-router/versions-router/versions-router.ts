import { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { Router } from "express";
import { requirePermission } from "../../../../../middlewares/require-permission-middleware/index.js";
import { uploadFileMiddleware } from "../../../../../middlewares/upload-file-middleware/index.js";
import { appDataSource } from "../../../../../utils/app-data-source/index.js";
import { conflictError } from "../../../../../utils/conflict-error/index.js";
import { generateCommonRes } from "../../../../../utils/generate-common-res/index.js";
import { notFoundError } from "../../../../../utils/not-found-error/index.js";
import { parseRequest } from "../../../../../utils/parse-request/index.js";
import { readUuidParam } from "../../../../../utils/read-uuid-param/index.js";
import { sendVersionFile } from "../../../../../utils/send-version-file/index.js";
import { storageDriver } from "../../../../../utils/storage-driver/index.js";
import {
  createDocumentVersionRequestSchema,
  updateDocumentVersionRequestSchema,
} from "../../../../../validators/document-validators/index.js";
import { findDocumentOrThrow } from "../_services/find-document-or-throw/index.js";
import { saveUploadedVersion } from "../_services/save-uploaded-version/index.js";
import { toDocumentDetailResponse } from "../_utils/to-document-detail-response/index.js";

const router = Router({ mergeParams: true });

async function findTargetOrThrow(req: Parameters<typeof readUuidParam>[0]) {
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const versionId = readUuidParam(req, "versionId");
  const version = document.versions.find((item) => item.id === versionId);
  if (!version) {
    throw notFoundError("버전");
  }
  return { document, version };
}

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
  const { document, version } = await findTargetOrThrow(req);
  await appDataSource.getRepository(DocumentVersionEntity).update(version.id, { versionName });
  res.json(generateCommonRes(toDocumentDetailResponse(await findDocumentOrThrow(appDataSource.manager, document.id))));
});

router.delete("/:versionId", requirePermission("file.detail.version.update"), async (req, res) => {
  const { document, version } = await findTargetOrThrow(req);
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
  const { version } = await findTargetOrThrow(req);
  sendVersionFile(res, version);
});

export const versionsRouter = router;
