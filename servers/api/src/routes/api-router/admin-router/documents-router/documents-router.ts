import type { DOCUMENT_LIST_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import { Router } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { requirePermission } from "#/middlewares/require-permission-middleware/index.js";
import { uploadFileMiddleware } from "#/middlewares/upload-file-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { generateCommonRes } from "#/utils/generate-common-res/index.js";
import { parseRequest } from "#/utils/parse-request/index.js";
import { readUuidParam } from "#/utils/read-uuid-param/index.js";
import {
  bulkDeleteDocumentsRequestSchema,
  createDocumentRequestSchema,
  documentListQuerySchema,
  updateDocumentRequestSchema,
} from "#/validators/document-validators/index.js";
import { deleteDocuments } from "./_services/delete-documents/index.js";
import { findDocumentOrThrow } from "./_services/find-document-or-throw/index.js";
import { listDocuments } from "./_services/list-documents/index.js";
import { saveUploadedVersion } from "./_services/save-uploaded-version/index.js";
import { toDocumentDetailResponse } from "./_utils/to-document-detail-response/index.js";
import { toDocumentSummaryResponse } from "./_utils/to-document-summary-response/index.js";
import { shareLinksRouter } from "./share-links-router/index.js";
import { versionsRouter } from "./versions-router/index.js";

const router = Router();

router.get("/", requirePermission("file.list.access"), async (req, res) => {
  const query = parseRequest(documentListQuerySchema, req.query);
  const { documents, total } = await listDocuments(query);
  const body: ResBody<typeof DOCUMENT_LIST_API>["data"] = {
    items: documents.map(toDocumentSummaryResponse),
    total,
    page: query.page,
    size: query.size,
  };
  res.json(generateCommonRes(body));
});

router.post("/", requirePermission("file.list.create"), uploadFileMiddleware, async (req, res) => {
  const body = parseRequest(createDocumentRequestSchema, req.body);
  const file = req.file as Express.Multer.File;
  const documentId = await appDataSource.transaction(async (manager) => {
    const document = await manager.getRepository(DocumentEntity).save({ name: body.name, defaultVersionId: null });
    await saveUploadedVersion(manager, { documentId: document.id, versionName: body.versionName, file });
    return document.id;
  });
  res
    .status(201)
    .json(generateCommonRes(toDocumentDetailResponse(await findDocumentOrThrow(appDataSource.manager, documentId))));
});

router.delete("/", requirePermission("file.list.delete"), async (req, res) => {
  const { ids } = parseRequest(bulkDeleteDocumentsRequestSchema, req.body);
  res.json(generateCommonRes({ deletedCount: await deleteDocuments(ids) }));
});

router.get("/:documentId", requirePermission("file.detail.access"), async (req, res) => {
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  res.json(generateCommonRes(toDocumentDetailResponse(document)));
});

router.patch("/:documentId", requirePermission("file.detail.update"), async (req, res) => {
  const body = parseRequest(updateDocumentRequestSchema, req.body);
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const isForeignVersion =
    !!body.defaultVersionId && !document.versions.some((version) => version.id === body.defaultVersionId);
  if (isForeignVersion) {
    throw new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "이 자료의 버전이 아닙니다.");
  }

  await appDataSource.getRepository(DocumentEntity).update(document.id, body);
  res.json(generateCommonRes(toDocumentDetailResponse(await findDocumentOrThrow(appDataSource.manager, document.id))));
});

router.delete("/:documentId", requirePermission("file.list.delete"), async (req, res) => {
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  await deleteDocuments([document.id]);
  res.status(204).end();
});

// /api/admin/documents/:documentId/versions/**/*
router.use("/:documentId/versions", versionsRouter);

// /api/admin/documents/:documentId/share-links/**/*
router.use("/:documentId/share-links", shareLinksRouter);

export const documentsRouter = router;
