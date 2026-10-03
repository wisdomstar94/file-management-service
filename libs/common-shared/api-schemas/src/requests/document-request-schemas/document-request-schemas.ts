import { z } from "zod";
import { paginationQuerySchema } from "../pagination-query-schema/index.js";

const versionNameSchema = z.string().trim().min(1, "버전명을 입력하세요.").max(100);

export const documentListQuerySchema = paginationQuerySchema.extend({
  keyword: z.string().trim().max(300).optional(),
  /** 자료 등록일 기준 최근 N일. 없으면 전체 */
  createdWithinDays: z.coerce.number().int().min(1).max(3650).optional(),
});

/** multipart 의 텍스트 필드. 파일은 `file` 필드로 함께 받는다. */
export const createDocumentRequestSchema = z.object({
  name: z.string().trim().min(1, "자료명을 입력하세요.").max(300),
  versionName: versionNameSchema,
});

/** `defaultVersionId` 가 `null` 이면 최신 버전을 따른다. */
export const updateDocumentRequestSchema = z.object({
  name: z.string().trim().min(1, "자료명을 입력하세요.").max(300).optional(),
  defaultVersionId: z.uuid().nullable().optional(),
});

export const bulkDeleteDocumentsRequestSchema = z.object({
  ids: z.array(z.uuid()).min(1, "삭제할 자료를 선택하세요.").max(500),
});

export const createDocumentVersionRequestSchema = z.object({ versionName: versionNameSchema });

export const updateDocumentVersionRequestSchema = z.object({ versionName: versionNameSchema });

export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;
export type CreateDocumentRequest = z.infer<typeof createDocumentRequestSchema>;
export type UpdateDocumentRequest = z.infer<typeof updateDocumentRequestSchema>;
export type BulkDeleteDocumentsRequest = z.infer<typeof bulkDeleteDocumentsRequestSchema>;
export type CreateDocumentVersionRequest = z.infer<typeof createDocumentVersionRequestSchema>;
export type UpdateDocumentVersionRequest = z.infer<typeof updateDocumentVersionRequestSchema>;
