import type {
  CREATE_ADMIN_ACCOUNT_API,
  UPDATE_ADMIN_ACCOUNT_API,
} from "@fms/api-schemas/schemas/admin-account-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";

const loginIdSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_.-]{3,100}$/, "아이디는 영문 · 숫자 · `_` `.` `-` 3~100자입니다.");
const passwordSchema = z.string().min(8, "비밀번호는 8자 이상입니다.").max(200);

export const createAdminAccountRequestSchema = z.object({
  loginId: loginIdSchema,
  password: passwordSchema,
  nickname: z.string().trim().min(1, "닉네임을 입력하세요.").max(100),
  memo: z.string().max(2000).default(""),
  permissionGroupId: z.uuid(),
  accessPolicyGroupId: z.uuid(),
}) satisfies z.ZodType<ReqBody<typeof CREATE_ADMIN_ACCOUNT_API>>;

/** 비밀번호는 바꿀 때만 보낸다. */
export const updateAdminAccountRequestSchema = createAdminAccountRequestSchema
  .omit({ loginId: true, password: true })
  .partial()
  .extend({ password: passwordSchema.optional() }) satisfies z.ZodType<ReqBody<typeof UPDATE_ADMIN_ACCOUNT_API>>;
