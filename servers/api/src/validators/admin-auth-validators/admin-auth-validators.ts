import type {
  ADMIN_LOGIN_API,
  ADMIN_REFRESH_TOKEN_API,
  ADMIN_SHORT_TIME_TOKEN_API,
} from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";

export const adminLoginRequestSchema = z.object({
  loginId: z.string().trim().min(1, "아이디를 입력하세요."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
}) satisfies z.ZodType<ReqBody<typeof ADMIN_LOGIN_API>>;

export const adminRefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
}) satisfies z.ZodType<ReqBody<typeof ADMIN_REFRESH_TOKEN_API>>;

export const adminShortTimeTokenRequestSchema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("UPLOAD_DOCUMENT") }),
  z.object({ purpose: z.literal("UPLOAD_DOCUMENT_VERSION"), documentId: z.uuid() }),
  z.object({ purpose: z.literal("DOWNLOAD_DOCUMENT_VERSION"), documentId: z.uuid(), versionId: z.uuid() }),
]) satisfies z.ZodType<ReqBody<typeof ADMIN_SHORT_TIME_TOKEN_API>>;
