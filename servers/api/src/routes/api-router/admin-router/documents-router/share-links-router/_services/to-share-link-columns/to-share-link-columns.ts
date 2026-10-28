import type { UPDATE_SHARE_LINK_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { hashPassword } from "@fms/password-handler/passwords/hash-password";
import type { EntityManager } from "typeorm";
import { HttpError } from "#/classes/http-error/index.js";
import type { DocumentWithVersions } from "../../../_types/document-with-versions/index.js";

/** 요청 값을 share_link 컬럼 값으로 바꾼다. 비밀번호는 해시하고, 참조하는 버전 · 접근 정책 그룹이 유효한지 확인한다. */
export async function toShareLinkColumns(
  manager: EntityManager,
  document: DocumentWithVersions,
  body: ReqBody<typeof UPDATE_SHARE_LINK_API>,
): Promise<Partial<ShareLinkEntity>> {
  const { password, availableFrom, availableUntil, ...rest } = body;
  const isForeignVersion =
    !!rest.fixedVersionId && !document.versions.some((version) => version.id === rest.fixedVersionId);
  const isMissingPolicy =
    !!rest.accessPolicyGroupId &&
    !(await manager.getRepository(AccessPolicyGroupEntity).exists({ where: { id: rest.accessPolicyGroupId } }));
  if (isForeignVersion || isMissingPolicy) {
    throw new HttpError(400, API_ERROR_CODE.VALIDATION_FAILED, "존재하지 않는 버전 또는 접근 정책 그룹입니다.");
  }

  const columns: Partial<ShareLinkEntity> = { ...rest };
  if (password !== undefined) {
    columns.passwordHash = password === null ? null : await hashPassword(password);
  }
  if (availableFrom !== undefined) {
    columns.availableFrom = availableFrom === null ? null : new Date(availableFrom);
  }
  if (availableUntil !== undefined) {
    columns.availableUntil = availableUntil === null ? null : new Date(availableUntil);
  }
  if (rest.defaultVersionMode === "FOLLOW_DOCUMENT") {
    columns.fixedVersionId = null;
  }
  return columns;
}
