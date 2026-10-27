import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { ResBody } from "../../types/api-schema-utils/index.js";
import type { DOCUMENT_LIST_API } from "../document-api-schemas/index.js";

type DocumentVersionSummary = ResBody<typeof DOCUMENT_LIST_API>["data"]["items"][number]["latestVersion"];

type ShareLink = {
  id: string;
  token: string;
  accessPolicyGroup: { id: string; name: string } | null;
  hasPassword: boolean;
  downloadCount: number;
  maxDownloadCount: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  defaultVersionMode: "FOLLOW_DOCUMENT" | "FIXED";
  fixedVersion: DocumentVersionSummary | null;
  /** 이 링크에서 실제로 기본으로 보여질 버전 */
  effectiveDefaultVersion: DocumentVersionSummary;
  isShowOtherVersions: boolean;
  isAllowOtherVersionDownload: boolean;
  isShowDownloadStatus: boolean;
  /** `SCHEDULED` 시작 전 · `EXPIRED` 기간 종료 · `EXHAUSTED` 허용 수 소진 */
  availability: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED";
  createdAt: string;
  updatedAt: string;
};

type CreateShareLinkBody = {
  accessPolicyGroupId: string | null;
  /** 문자열이면 그 비밀번호로 설정, `null` 이면 비밀번호 해제. 수정 시 생략하면 기존 값 유지 */
  password: string | null;
  maxDownloadCount: number | null;
  /** offset 을 포함한 ISO 8601 일시 */
  availableFrom: string | null;
  /** offset 을 포함한 ISO 8601 일시 */
  availableUntil: string | null;
  defaultVersionMode: "FOLLOW_DOCUMENT" | "FIXED";
  fixedVersionId: string | null;
  isShowOtherVersions: boolean;
  isAllowOtherVersionDownload: boolean;
  isShowDownloadStatus: boolean;
};

export const SHARE_LINK_LIST_API = {
  url: "/api/admin/documents/:documentId/share-links",
  method: "GET",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ShareLink[]>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

/** 링크 생성 · 수정 모달의 접근 정책 그룹 선택지 */
export const SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API = {
  url: "/api/admin/documents/:documentId/share-links/assignable-access-policy-groups",
  method: "GET",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ id: string; name: string }[]>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

export const CREATE_SHARE_LINK_API = {
  url: "/api/admin/documents/:documentId/share-links",
  method: "POST",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<CreateShareLinkBody>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ShareLink>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

export const UPDATE_SHARE_LINK_API = {
  url: "/api/admin/documents/:documentId/share-links/:linkId",
  method: "PATCH",
  request: {
    params: typeOf<{ documentId: string; linkId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<Partial<CreateShareLinkBody>>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ShareLink>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

export const DELETE_SHARE_LINK_API = {
  url: "/api/admin/documents/:documentId/share-links/:linkId",
  method: "DELETE",
  request: {
    params: typeOf<{ documentId: string; linkId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;
