import type {
  BULK_DELETE_DOCUMENTS_API,
  DOCUMENT_LIST_API,
  UPDATE_DOCUMENT_API,
} from "@fms/api-schemas/schemas/document-api-schemas";
import type { UPDATE_DOCUMENT_VERSION_API } from "@fms/api-schemas/schemas/document-version-api-schemas";
import type { ReqBody, ReqQuery } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";
import { paginationQuerySchema } from "../pagination-query-validators/index.js";

const versionNameSchema = z.string().trim().min(1, "버전명을 입력하세요.").max(100);

export const documentListQuerySchema = paginationQuerySchema.extend({
  keyword: z.string().trim().max(300).optional(),
  /** 자료 등록일 기준 최근 N일. 없으면 전체 */
  createdWithinDays: z.coerce.number().int().min(1).max(3650).optional(),
}) satisfies z.ZodType<ReqQuery<typeof DOCUMENT_LIST_API>>;

/** multipart 의 텍스트 필드. 파일은 `file` 필드로 함께 받는다. (schema 의 body 가 `FormData` 라 타입을 묶지 않는다) */
export const createDocumentRequestSchema = z.object({
  name: z.string().trim().min(1, "자료명을 입력하세요.").max(300),
  versionName: versionNameSchema,
});

/** `defaultVersionId` 가 `null` 이면 최신 버전을 따른다. */
export const updateDocumentRequestSchema = z.object({
  name: z.string().trim().min(1, "자료명을 입력하세요.").max(300).optional(),
  defaultVersionId: z.uuid().nullable().optional(),
}) satisfies z.ZodType<ReqBody<typeof UPDATE_DOCUMENT_API>>;

export const bulkDeleteDocumentsRequestSchema = z.object({
  ids: z.array(z.uuid()).min(1, "삭제할 자료를 선택하세요.").max(500),
}) satisfies z.ZodType<ReqBody<typeof BULK_DELETE_DOCUMENTS_API>>;

export const createDocumentVersionRequestSchema = z.object({
  versionName: versionNameSchema,
});

export const updateDocumentVersionRequestSchema = z.object({
  versionName: versionNameSchema,
}) satisfies z.ZodType<ReqBody<typeof UPDATE_DOCUMENT_VERSION_API>>;

/** 기본값이 채워진 검증 결과 */
export type ParsedDocumentListQuery = z.infer<typeof documentListQuerySchema>;
