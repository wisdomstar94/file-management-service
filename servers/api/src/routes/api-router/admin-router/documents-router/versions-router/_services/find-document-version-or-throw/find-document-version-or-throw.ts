import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import { findDocumentOrThrow } from "../../../_services/find-document-or-throw/index.js";

export async function findDocumentVersionOrThrow(req: Parameters<typeof readUuidParam>[0]) {
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const versionId = readUuidParam(req, "versionId");
  const version = document.versions.find((item) => item.id === versionId);
  if (!version) {
    throw notFoundError("버전");
  }
  return { document, version };
}
