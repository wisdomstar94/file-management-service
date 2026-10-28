import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import type { Response } from "express";
import { storageDriver } from "#/singleton-classes/storage-driver/index.js";
import { toContentDisposition } from "./_utils/to-content-disposition/index.js";

/** 버전 파일을 원래 파일명으로 내려준다. */
export function sendVersionFile(res: Response, version: DocumentVersionEntity): void {
  res.setHeader("Content-Type", version.mimeType || "application/octet-stream");
  res.setHeader("Content-Length", String(version.fileSize));
  res.setHeader("Content-Disposition", toContentDisposition(version.fileName));

  const stream = storageDriver.createReadStream(version.storageKey);
  stream.on("error", (err) => res.destroy(err));
  stream.pipe(res);
}
