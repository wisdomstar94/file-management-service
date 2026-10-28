import type { Request } from "express";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import { findDocumentOrThrow } from "../../../_services/find-document-or-throw/index.js";
import { SHARE_LINK_RELATIONS } from "../../_consts/share-link-relations/index.js";
import { getShareLinkRepository } from "../../_utils/get-share-link-repository/index.js";

export async function findShareLinkOrThrow(req: Request) {
  const document = await findDocumentOrThrow(appDataSource.manager, readUuidParam(req, "documentId"));
  const link = await getShareLinkRepository().findOne({
    where: { id: readUuidParam(req, "linkId"), documentId: document.id },
    relations: SHARE_LINK_RELATIONS,
  });
  if (!link) {
    throw notFoundError("외부 공개 링크");
  }
  return { document, link };
}
