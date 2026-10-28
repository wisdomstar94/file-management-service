import { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import type { Request } from "express";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { assertAccessPolicy } from "#/utils/assert-access-policy/index.js";
import { notFoundError } from "#/utils/not-found-error/index.js";

/** 공유 링크 키로 링크 · 자료 · 버전(최신순)을 읽고, 링크에 접근 정책이 있으면 통과해야 한다. */
export async function findOpenShareLinkOrThrow(req: Request) {
  const link = await appDataSource.getRepository(ShareLinkEntity).findOne({
    where: { shareLinkKey: String(req.params.shareLinkKey) },
    relations: { document: true, accessPolicyGroup: true },
  });
  if (!link?.document) {
    throw notFoundError("링크");
  }
  if (link.accessPolicyGroup) {
    assertAccessPolicy(req, { group: link.accessPolicyGroup });
  }

  const versions = await appDataSource
    .getRepository(DocumentVersionEntity)
    .find({ where: { documentId: link.documentId }, order: { seq: "DESC" } });
  return { link, document: link.document, versions };
}
