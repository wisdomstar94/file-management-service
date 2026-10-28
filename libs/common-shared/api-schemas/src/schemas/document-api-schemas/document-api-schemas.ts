import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";

type DocumentVersion = {
  id: string;
  seq: number;
  versionName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isLatest: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type DocumentVersionSummary = { id: string; versionName: string };

type DocumentSummary = {
  id: string;
  name: string;
  versionCount: number;
  latestVersion: DocumentVersionSummary;
  /** 목록의 파일 형식 아이콘을 고르는 데 쓴다. */
  latestVersionFileName: string;
  /** `null` 이면 최신 버전을 따른다. */
  fixedDefaultVersion: DocumentVersionSummary | null;
  createdAt: string;
  latestVersionCreatedAt: string;
};

type DocumentDetail = {
  id: string;
  name: string;
  /** `null` 이면 최신 버전을 따른다. */
  defaultVersionId: string | null;
  latestVersion: DocumentVersion;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
};

export const DOCUMENT_LIST_API = {
  url: "/api/admin/documents",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<{
      page?: number;
      size?: number;
      keyword?: string;
      /** 자료 등록일 기준 최근 N일. 없으면 전체 */
      createdWithinDays?: number;
    }>(),
  },
  response: typeOf<ApiSuccessBody<{ items: DocumentSummary[]; total: number; page: number; size: number }>>(),
  tags: ["documents"],
} as const satisfies ApiSchema;

/**
 * 브라우저가 api 를 직접 호출한다. `authorization` 에 `UPLOAD_DOCUMENT` 용 short-time token 을 담는다.
 * 본문은 `name` · `versionName` 텍스트 필드 + `file` 을 담은 `FormData`
 */
export const CREATE_DOCUMENT_API = {
  url: "/api/admin/documents",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<{ authorization: string }>(),
    body: typeOf<FormData>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<DocumentDetail>>(),
  tags: ["documents"],
} as const satisfies ApiSchema;

export const BULK_DELETE_DOCUMENTS_API = {
  url: "/api/admin/documents",
  method: "DELETE",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ ids: string[] }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ deletedCount: number }>>(),
  tags: ["documents"],
} as const satisfies ApiSchema;

export const DOCUMENT_DETAIL_API = {
  url: "/api/admin/documents/:documentId",
  method: "GET",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<DocumentDetail>>(),
  tags: ["documents"],
} as const satisfies ApiSchema;

/** `defaultVersionId` 가 `null` 이면 최신 버전을 따른다. */
export const UPDATE_DOCUMENT_API = {
  url: "/api/admin/documents/:documentId",
  method: "PATCH",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ name?: string; defaultVersionId?: string | null }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<DocumentDetail>>(),
  tags: ["documents"],
} as const satisfies ApiSchema;

export const DELETE_DOCUMENT_API = {
  url: "/api/admin/documents/:documentId",
  method: "DELETE",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["documents"],
} as const satisfies ApiSchema;
