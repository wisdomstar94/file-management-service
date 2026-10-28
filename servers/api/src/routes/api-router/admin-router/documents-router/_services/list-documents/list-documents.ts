import { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import type { ParsedDocumentListQuery } from "#/validators/document-validators/index.js";
import type { DocumentWithVersions } from "../find-document-or-throw/index.js";

export async function listDocuments(query: ParsedDocumentListQuery) {
  const builder = appDataSource
    .getRepository(DocumentEntity)
    .createQueryBuilder("document")
    .leftJoinAndSelect("document.versions", "version")
    .orderBy("document.createdAt", "DESC")
    .addOrderBy("version.seq", "DESC")
    .skip((query.page - 1) * query.size)
    .take(query.size);

  if (query.keyword) {
    builder.andWhere("document.name ILIKE :keyword", { keyword: `%${query.keyword.replace(/[%_\\]/g, "\\$&")}%` });
  }
  if (query.createdWithinDays) {
    builder.andWhere("document.createdAt >= now() - make_interval(days => :days)", { days: query.createdWithinDays });
  }

  const [documents, total] = await builder.getManyAndCount();
  return { documents: documents as DocumentWithVersions[], total };
}
